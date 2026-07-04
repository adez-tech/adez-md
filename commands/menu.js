import botCommands from '../src/menu_structure.js';
import { getAllCommands } from '../lib/router.js';

export const name = 'menu';
export const category = 'General';
export const description = 'Displays the main control command layout menu.';

export async function run({ sock, from, m, sender }) {
    let menuDisplay = "🤖 *ADEZ-MD COMMAND LIST* 🤖\n\n";

    // Loop through your categories and format beautifully
    for (const [category, commands] of Object.entries(botCommands)) {
        menuDisplay += `╭─────「 ${category} 」───┈⊷\n`;
        
        commands.forEach(cmd => {
            menuDisplay += `││◦➛ ${cmd}\n`;
        });
        
        menuDisplay += `╰──────────────┈⊷\n\n`;
    }

    // Send message using your bot socket instance (Baileys method)
    await sock.sendMessage(from, { 
        text: menuDisplay.trim(),
        mentions: [sender]
    }, { quoted: m });
}