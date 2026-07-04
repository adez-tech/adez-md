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
const port = process.env.PORT || 3000;

const supabase = createClient(supabaseUrl, supabaseKey);
const sessionFolder = './session';

let lastBackupTime = 0;
const BACKUP_THROTTLE_MS = 2 * 60 * 1000; // Force maximum once per 2 minutes safeguard

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
            if (fs.existsSync(sessionFolder)) fs.rmSync(sessionFolder, { recursive: true, force: true });
            fs.mkdirSync(sessionFolder, { recursive: true });

            const zipBuffer = Buffer.from(data.data, 'base64');
            const zip = new AdmZip(zipBuffer);
            zip.extractAllTo(sessionFolder, true);
            console.log('✅ Local session files completely synchronized.');
        } else {
            console.log('🆕 No prior cloud records detected. Fresh credentials required.');
        }
    } catch (err) {
        console.log('❌ [Session Download Failed]:', err.message);
    }
}

// 2. THE MAIN BOT CONSTRUCTOR ENGINE
async function startBot() {
    // Synchronize loaders
    await loadModules();
    await loadObservers();
    await downloadSessionFromSupabase();

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }), // Hide messy raw logs
        printQRInTerminal: false, // Disables annoying terminal QR arrays
        syncFullHistory: false, // CRITICAL: Stop heavy historic downloads to prevent memory loops
        fireInitQueries: false // CRITICAL: Skip deep startup queries
    });

    // Handle incoming actions and events from WhatsApp
    sock.ev.on('creds.update', async () => {
        await saveCreds();
        await uploadSessionToSupabase();
    });

    sock.ev.on('messages.upsert', async (msg) => {
        await handleMessage(sock, msg);
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("📄 QR Code generated! Scan it or make sure pairing mode is active.");
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`🔌 Connection severed. Reason code: ${statusCode}`);

            // FIX: Force reconnection even if code is 405/loggedOut when database is completely empty
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            
            // If it's a 405, but we deliberately have an empty session ID / no session in DB, DO NOT drop out.
            if (isLoggedOut && !process.env.SESSION_ID) {
                console.log("🆕 Fresh start environment detected. Forcing setup routine...");
                setTimeout(() => startBot(), 5000); // Wait 5 seconds and retry safely
            } else if (!isLoggedOut) {
                // Standard crash reconnection handler
                console.log('🔄 Attemping standard reconnection...');
                setTimeout(() => startBot(), 5000);
            } else {
                console.log("❌ Device explicitly unlinked by user. Stopped.");
            }
        } else if (connection === 'open') {
            console.log('🚀 ADEZ-MD IS OPERATIONAL AND ONLINE!');
            await uploadSessionToSupabase();
            
            // Send confirmation directly to your phone
            if (ownerNumber) {
                const cleanJid = ownerNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await sock.sendMessage(cleanJid, { text: '🎉 *ADEZ-MD Connected Successfully!*\n\nYour WhatsApp bot is officially running and backed up onto your Cloud Server.' });
            }
        }
    });

    // 3. INTERNAL ROUTER FOR THE PAIRING SCREEN (SOCKET.IO)
    io.removeAllListeners('connection');
    io.on('connection', (socket) => {
        socket.on('request_code', async (num) => {
            try {
                const formattedNum = num.replace(/[^0-9]/g, '');
                console.log(`📲 Pairing code request initiated for number: ${formattedNum}`);
                
                let code = await sock.requestPairingCode(formattedNum);
                code = code?.match(/.{1,4}/g)?.join('-') || code; // Break it down into readable ABCD-EFGH format
                
                socket.emit('pairing_code', code);
            } catch (err) {
                socket.emit('pairing_error', 'Failed to retrieve code. Check if the server is already linked.');
            }
        });
    });
}

// 4. THE WEB SERVER PLATFORM SETUP
const app = express();
const server = createServer(app);
const io = new Server(server);

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
    startBot().catch(err => console.log("Engine Boot Error:", err));
});
