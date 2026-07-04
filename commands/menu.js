import botCommands from '../src/menu_structure.js';

export const name = 'menu';
export const category = 'General';
export const description = 'Displays the main control command layout menu.';

export async function run({ sock, from, m, sender }) {
  let menuDisplay = "🔥 *ADEZ TECH OFFICIAL MENU* 🔥\n\n";

  for (const [category, commands] of Object.entries(botCommands)) {
    menuDisplay += `⬡──┽ *👑 ${category.toUpperCase()}* ┾──⬡\n`;
    
    commands.forEach(cmd => {
      menuDisplay += `┠ ⚙️ ${cmd}\n`;
    });
    
    menuDisplay += `⬡───────────────────⬡\n\n`;
  }

  await sock.sendMessage(from, { 
    text: menuDisplay.trim(),
    mentions: [sender]
  }, { quoted: m });
}