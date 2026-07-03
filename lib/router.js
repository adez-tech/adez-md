import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const commands = new Map();
const observers = [];

// Helper function to turn standard WhatsApp IDs into uniform formats
export function resolveToJid(jidStr) {
    if (!jidStr) return null;
    if (jidStr.includes('@lid')) {
        return jidStr.split(':')[0] + '@s.whatsapp.net';
    }
    return jidStr;
}

// 1. Recursive Command Loader (Compatible with Render/Linux paths)
export async function loadModules(dir = './commands') {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await loadModules(fullPath); // Crawl inside subfolders
        } else if (file.endsWith('.js')) {
            try {
                const fileUrl = pathToFileURL(path.resolve(fullPath)).href;
                const module = await import(fileUrl);
                
                if (!module.name) {
                    console.log(`❌ SKIPPED: ${file} is missing an export const name`);
                    continue;
                }

                // Duplicate command checking safeguard
                if (commands.has(module.name)) {
                    console.log(`⚠️ WARNING: Duplicate command name "${module.name}" detected in ${file}. Skipping.`);
                    continue;
                }

                commands.set(module.name, module);
                console.log(`✅ Loaded Command: ${module.name} [${module.category || 'General'}]`);
            } catch (err) {
                console.log(`❌ FAILED TO LOAD ${file}:\n`, err.stack);
            }
        }
    }
}

// 2. Observer Loader (Silently watches chats)
export async function loadObservers(dir = './observers') {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
        try {
            const fileUrl = pathToFileURL(path.resolve(path.join(dir, file))).href;
            const module = await import(fileUrl);
            observers.push(module);
            console.log(`👁️ Loaded Observer: ${file}`);
        } catch (err) {
            console.log(`❌ FAILED TO LOAD OBSERVER ${file}:\n`, err.stack);
        }
    }
}

// 3. The Grand Handler (Processes incoming messages)
export async function handleMessage(sock, msg) {
    try {
        if (!msg.messages || !msg.messages[0]) return;
        const m = msg.messages[0];
        if (m.key.fromMe) return; // Ignore your own automated messages to avoid loops

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // Extract raw text from different types of incoming WhatsApp messages
        const body = m.message?.conversation || 
                     m.message?.extendedTextMessage?.text || 
                     m.message?.imageMessage?.caption || 
                     m.message?.videoMessage?.caption || "";

        const prefix = process.env.PREFIX || '.';
        const isCmd = body.startsWith(prefix);
        const sender = resolveToJid(m.key.participant || from);
        const ownerNumber = process.env.OWNER_NUMBER + '@s.whatsapp.net';
        const isOwner = sender === ownerNumber;

        // Fetch group metadata and setup admin rights variables
        let groupMetadata = null;
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            try {
                groupMetadata = await sock.groupMetadata(from);
                const botJid = resolveToJid(sock.user.id);
                const participants = groupMetadata.participants || [];
                
                const userAdminState = participants.find(p => resolveToJid(p.id) === sender);
                const botAdminState = participants.find(p => resolveToJid(p.id) === botJid);

                isAdmin = userAdminState?.admin ? true : false;
                isBotAdmin = botAdminState?.admin ? true : false;
            } catch {
                // Fail silently if metadata fetch fails
            }
        }

        // Bundle up the utilities to pass into our commands
        const context = {
            sock,
            m,
            from,
            body,
            sender,
            isGroup,
            isOwner,
            isAdmin,
            isBotAdmin,
            groupMetadata,
            args: body.trim().split(/ +/).slice(1)
        };

        // Run Observers first (e.g. Antilink check)
        for (const observer of observers) {
            if (typeof observer.run === 'function') {
                await observer.run(context);
            }
        }

        if (!isCmd) return;

        const commandName = body.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
        const command = commands.get(commandName);

        if (!command) return;

        // Safety guards
        if (command.onlyOwner && !isOwner) {
            return sock.sendMessage(from, { text: "❌ This command is strictly reserved for the Bot Owner." }, { quoted: m });
        }
        if (command.onlyGroup && !isGroup) {
            return sock.sendMessage(from, { text: "❌ This command can only be executed inside a Group Chat." }, { quoted: m });
        }
        if (command.onlyAdmin && !isAdmin && !isOwner) {
            return sock.sendMessage(from, { text: "❌ You must be a Group Administrator to use this command." }, { quoted: m });
        }
        if (command.botMustBeAdmin && !isBotAdmin) {
            return sock.sendMessage(from, { text: "❌ Please make the bot an Administrator first to execute this." }, { quoted: m });
        }

        // Execute the command code block safely
        await command.run(context);

    } catch (err) {
        console.log(`❌ ERROR EXECUTING HANDLER:\n`, err.stack);
    }
}

export function getAllCommands() {
    return Array.from(commands.values());
}