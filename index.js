import * as baileysRaw from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

// Normalize module shape so this file works with both default and named/ESM exports
const baileys = (baileysRaw && baileysRaw.default) ? baileysRaw.default : baileysRaw;
const makeWASocket = baileys.makeWASocket || baileys;
const useMultiFileAuthState = baileys.useMultiFileAuthState || baileysRaw.useMultiFileAuthState;
const DisconnectReason = baileys.DisconnectReason || baileysRaw.DisconnectReason;

import pino from 'pino';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// ==========================================
// GLOBALS & INITIALIZATION
// ==========================================
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const PORT = process.env.PORT || 10000;

let sock = null;

const supabase = createClient(
    process.env.SUPABASE_URL || '', 
    process.env.SUPABASE_KEY || ''
);
const SESSION_ID = 'ADEZ-MD-SESSION';

// ==========================================
// DATA UTILITIES
// ==========================================
async function syncSessionFiles(cloudData) {
    if (!cloudData) return;
    try {
        if (!fs.existsSync('./session')) fs.mkdirSync('./session');
        fs.writeFileSync('./session/creds.json', JSON.stringify(cloudData, null, 2));
        console.log('✅ Local session files completely synchronized.');
    } catch (err) {
        console.error('❌ Failed to write credentials file:', err.message);
    }
}

async function loadSessionFromCloud() {
    try {
        console.log('🔍 Checking Supabase for pre-existing cloud sessions...');
        const { data, error } = await supabase
            .from('bu_sessions')
            .select('data')
            .eq('id', SESSION_ID)
            .single();

        if (error || !data) {
            console.log('🆕 No prior cloud records detected. Fresh credentials required.');
            return null;
        }
        return JSON.parse(data.data);
    } catch (err) {
        return null;
    }
}

async function saveSessionToCloud() {
    try {
        if (!fs.existsSync('./session/creds.json')) return;
        const localData = fs.readFileSync('./session/creds.json', 'utf-8');
        
        const { error } = await supabase
            .from('bu_sessions')
            .upsert({ 
                id: SESSION_ID, 
                data: localData,
                updated_at: new Date()
            });

        if (error) throw error;
        console.log('☁️ [Database Sync] Session successfully protected in Supabase Cloud.');
    } catch (err) {
        console.error('❌ [Database Sync Error]:', err.message);
    }
}

// ==========================================
// CORE WHATSAPP CONNECTION HANDLING
// ==========================================
async function connectToWhatsApp() {
    // If local creds don't exist, recover them safely *before* initialization
    if (!fs.existsSync('./session/creds.json')) {
        const cloudState = await loadSessionFromCloud();
        if (cloudState) {
            await syncSessionFiles(cloudState);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');

    sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !process.env.PAIRING_NUMBER,
        auth: state,
        browser: ["Mac OS", "Chrome", "123.0.0.0"]
    });

    sock._pairingCodeSent = false;
    const isRegistered = !!state.creds?.me?.id;

    // Pairing Logic Fix
    if (process.env.PAIRING_NUMBER && !isRegistered) {
        if (!sock._pairingCodeSent) {
            sock._pairingCodeSent = true;
            const cleanNumber = process.env.PAIRING_NUMBER.replace(/[^0-9]/g, '');
            console.log(`📲 Requesting pairing code for: +${cleanNumber}...`);

            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    
                    console.log(`\n==================================================`);
                    console.log(`🔑 YOUR WHATSAPP PAIRING CODE:   ${code}`);
                    console.log(`==================================================\n`);

                    io.emit('pairing_code', { number: cleanNumber, code: code });
                } catch (pairErr) {
                    console.error('❌ Failed to generate pairing code:', pairErr.message);
                    sock._pairingCodeSent = false;
                }
            }, 6000); 
        }
    }

    // LISTENER: Incoming Message Command Processor
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            const prefix = process.env.PREFIX || ".";
            
            if (body.startsWith(prefix)) {
                const args = body.slice(prefix.length).trim().split(/ +/);
                const command = args.shift().toLowerCase();
                const from = msg.key.remoteJid;

                console.log(`📥 [Command Trigger]: ${command} from ${from}`);

                // Basic Test / Keep-Alive Command Check
                if (command === 'ping') {
                    await sock.sendMessage(from, { text: '🤖 Adez-MD online and running smoothly!' }, { quoted: msg });
                }
                
                // Route to external command files if your framework uses them here
            }
        } catch (msgErr) {
            console.error('❌ Error handling message context:', msgErr);
        }
    });

    // Connection Lifecycle
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            console.log('🔄 Establishing secure handshakes with WhatsApp network...');
        }

        if (connection === 'open') {
            console.log('✅ Connection fully established! Adez-MD is active.');
            io.emit('bot_status', { state: 'open' });
            await saveSessionToCloud();
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error instanceof Boom) 
                ? lastDisconnect.error.output.statusCode 
                : null;
            
            console.log(`🔌 Connection closed. Status: ${statusCode}`);
            
            if (statusCode === DisconnectReason.loggedOut || statusCode === 405) {
                console.error('❌ Session terminated. Requires manual setup.');
                process.exit(1); 
            } else {
                setTimeout(() => connectToWhatsApp(), 5000);
            }
        }
    });

    sock.ev.on('creds.update', async () => {
        await saveCreds();
        if (fs.existsSync('./session/creds.json')) {
            await saveSessionToCloud();
        }
    });
}

// ==========================================
// APPLICATION SERVER SPIN UP
// ==========================================
function startServer() {
    app.get('/', (req, res) => {
        res.status(200).json({ status: "online", system: "Adez-MD Grid" });
    });

    httpServer.listen(PORT, () => {
        console.log(`🌐 Server web grid humming along on port ${PORT}`);
        connectToWhatsApp();
    });
}

startServer();
