import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { loadModules, loadObservers, handleMessage } from './lib/router.js';

// Initialize Config variables from our secure vault (.env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const sessionId = process.env.SESSION_ID || 'ADEZ-MD-SESSION';
const ownerNumber = process.env.OWNER_NUMBER;
const pairingNumber = process.env.PAIRING_NUMBER; // NEW: Capture pairing mode trigger
const port = process.env.PORT || 3000;

const supabase = createClient(supabaseUrl, supabaseKey);
const sessionFolder = './session';

let lastBackupTime = 0;
const BACKUP_THROTTLE_MS = 2 * 60 * 1000; // Force maximum once per 2 minutes safeguard
let sessionExists = false; // Track if a session was found
let sock = null; // Global socket reference
let io = null; // Global socket.io reference

// 1. DATABASE BACKUP LOGIC (Supabase Cloud Sync)
async function uploadSessionToSupabase() {
    const now = Date.now();
    if (now - lastBackupTime < BACKUP_THROTTLE_MS) return; // Throttle to prevent database rate limits
    
    try {
        if (!fs.existsSync(sessionFolder)) return;
        
        const zip = new AdmZip();
        zip.addLocalFolder(sessionFolder);
        const base64Data = zip.toBuffer().toString('base64');

        // Upsert drops a row if it exists, or creates a brand new one if it doesn't
        const { error } = await supabase
            .from('bu_sessions')
            .upsert({ id: sessionId, data: base64Data });

        if (error) throw error;
        lastBackupTime = now;
        console.log('☁️ [Database Sync] Session successfully protected in Supabase Cloud.');
    } catch (err) {
        console.log('❌ [Database Sync Error]:', err.message);
    }
}

async function downloadSessionFromSupabase() {
    try {
        console.log('🔍 Checking Supabase for pre-existing cloud sessions...');
        const { data, error } = await supabase
            .from('bu_sessions')
            .select('data')
            .eq('id', sessionId)
            .maybeSingle();

        if (error) throw error;
        if (data && data.data) {
            console.log('📦 Found matching cloud credentials. Restoring local session states...');
            sessionExists = true;
            if (fs.existsSync(sessionFolder)) fs.rmSync(sessionFolder, { recursive: true, force: true });
            fs.mkdirSync(sessionFolder, { recursive: true });

            const zipBuffer = Buffer.from(data.data, 'base64');
            const zip = new AdmZip(zipBuffer);
            zip.extractAllTo(sessionFolder, true);
            console.log('✅ Local session files completely synchronized.');
        } else {
            console.log('🆕 No prior cloud records detected. Fresh credentials required.');
            sessionExists = false;
            // Notify connected clients that pairing is required
            if (io) {
                io.emit('session_status', { exists: false, message: 'No session found. Please scan the pairing code.' });
            }
        }
    } catch (err) {
        console.log('❌ [Session Download Failed]:', err.message);
        sessionExists = false;
    }
}

// 2. THE MAIN BOT CONSTRUCTOR ENGINE
async function connectToWhatsApp() {
    // 1. Fetch your authentication state from the file system
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    
    // Check if credentials exist and are registered
    const isRegistered = state.creds?.me?.id ? true : false;
    const phoneNumber = pairingNumber?.replace(/[^0-9]/g, '');
    
    // Force pairing mode if PAIRING_NUMBER is set and no registration exists
    const forcePairing = phoneNumber && !isRegistered;

    sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Always false since we're in headless mode
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false,
        fireInitQueries: false
    });

    // CRITICAL: Wait for connection.update to fire before attempting pairing
    let connectionReady = false;
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        connectionReady = true;

        // Handle QR code (for backward compatibility)
        if (qr && !forcePairing) {
            console.log("📟 QR Code detected. Scan to authenticate.");
        }

        // PAIRING CODE GENERATION - Trigger only on first connection ready
        if (forcePairing && connection === 'connecting' && !sock._pairingCodeSent) {
            sock._pairingCodeSent = true; // Flag to prevent duplicate requests
            
            try {
                console.log(`📲 Requesting pairing code for: +${phoneNumber}...`);
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log(`\n${'='.repeat(50)}`);
                console.log(`🔑 YOUR WHATSAPP PAIRING CODE:\n`);
                console.log(`   ${code}`);
                console.log(`${'='.repeat(50)}\n`);
                
                // Notify frontend of pairing code
                if (io) {
                    io.emit('pairing_code', code);
                }
                
            } catch (error) {
                console.error("❌ Failed to generate pairing code:", error.message);
                sock._pairingCodeSent = false; // Reset flag to retry
            }
        }

        // Handle successful connection
        if (connection === 'open') {
            console.log("✅ WhatsApp connection established successfully!");
            sessionExists = true;
            
            // Notify your frontend/monitoring system here
            if (io) {
                io.emit('session_status', { exists: true, message: 'Bot is now online.' });
            }
        }

        // Handle disconnections
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reasonMessage = lastDisconnect?.error?.message || "Unknown error";
            
            console.log(`🔌 Connection closed. Status: ${statusCode} (${reasonMessage})`);

            // Determine if we should retry
            const shouldRetry = statusCode !== 401 && statusCode !== 405 && statusCode !== DisconnectReason.loggedOut;

            if (shouldRetry) {
                console.log("🔄 Reconnecting in 5 seconds...");
                setTimeout(() => connectToWhatsApp(), 5000);
            } else {
                console.log("❌ Authentication failed. Session may be expired or revoked.");
                console.log("💡 To re-establish connection, set PAIRING_NUMBER in .env and restart.");
                process.exit(1);
            }
        }
    });

    // Save credentials whenever they update
    sock.ev.on('creds.update', async () => {
        console.log("💾 Saving credentials...");
        await saveCreds();
        await uploadSessionToSupabase();
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (msg) => {
        await handleMessage(sock, msg);
    });

    // 3. INTERNAL ROUTER FOR THE PAIRING SCREEN (SOCKET.IO)
    io.removeAllListeners('connection');
    io.on('connection', (socket) => {
        // Immediately tell the client if a session exists
        socket.emit('session_check', { exists: sessionExists });
        
        // If no session exists, prompt for pairing code
        if (!sessionExists) {
            socket.emit('pairing_required', {
                message: 'No existing session found. Please provide your phone number to generate a pairing code.'
            });
        }

        socket.on('request_code', async (num) => {
            try {
                const formattedNum = num.replace(/[^0-9]/g, '');
                console.log(`📲 Pairing code request initiated for number: ${formattedNum}`);
                
                let code = await sock.requestPairingCode(formattedNum);
                code = code?.match(/.{1,4}/g)?.join('-') || code; // Break it down into readable ABCD-EFGH format
                
                console.log(`✅ Pairing code generated: ${code}`);
                socket.emit('pairing_code', code);
            } catch (err) {
                console.log(`❌ Pairing code error: ${err.message}`);
                socket.emit('pairing_error', 'Failed to retrieve code. Check if the server is already linked.');
            }
        });
    });

    return sock;
}

// 4. THE WEB SERVER PLATFORM SETUP
async function startServer() {
    // Synchronize loaders and download session from cloud
    await loadModules();
    await loadObservers();
    await downloadSessionFromSupabase();

    // Start the WhatsApp connection
    await connectToWhatsApp();
}

const app = express();
const server = createServer(app);
io = new Server(server);

app.use(express.static('public'));

// UptimeRobot Health Monitoring Endpoint
app.get('/', (req, res) => {
    res.json({ status: "healthy", bot: "ADEZ-MD", node: process.version });
});

// Route for your custom browser link page
app.get('/pair', (req, res) => {
    res.sendFile(path.resolve('./public/pair.html'));
});

server.listen(port, () => {
    console.log(`🌐 Server web grid humming along on port ${port}`);
    startServer().catch(err => console.log("Engine Boot Error:", err));
});
