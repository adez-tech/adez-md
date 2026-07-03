import { getAllCommands } from '../lib/router.js';

export const name = 'menu';
export const category = 'General';
export const description = 'Displays the main control command layout menu.';

export async function run({ sock, from, m, sender }) {
    const commands = getAllCommands();
    const prefix = process.env.PREFIX || '.';
    
    let menuText = `🤖 *ADEZ-MD BOT SYSTEM*\n`;
    menuText += `━━━━━━━━━━━━━━━━━━━\n\n`;
    menuText += `👋 Hello @${sender.split('@')[0]}\n`;
    menuText += `✨ *Prefix:* \`${prefix}\`\n`;
    menuText += `📦 *Total Commands:* ${commands.length}\n\n`;
    menuText += `*AVAILABLE COMMANDS:*\n`;
    
    // Loop through loaded commands and list them out
    commands.forEach(cmd => {
        menuText += `🔹 *${prefix}${cmd.name}* : _${cmd.description || 'No description provided'}_ \n`;
    });
    
    menuText += `\n━━━━━━━━━━━━━━━━━━━\n`;
    menuText += `💻 Powered by Adez Tech`;

    // Send the structured message to the chat and make sure it tags the user properly
    await sock.sendMessage(from, { 
        text: menuText, 
        mentions: [sender] 
    }, { quoted: m });
}