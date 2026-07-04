# 🤖 ADEZ-MD BOT

A powerful, feature-rich WhatsApp bot built with Node.js and Baileys, offering an extensive command system with 24+ categories and 100+ commands.

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Command Categories](#-command-categories)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

✅ **100+ Commands** across 24+ categories  
✅ **Dynamic Menu System** with beautiful Cyber Neon Grid formatting  
✅ **AI Integration** (Mistral, Claude, Bard, Perplexity, GPT, and more)  
✅ **Media Processing** (Image editing, video conversion, audio effects)  
✅ **File Management** (Upload, download, format conversion tools)  
✅ **Group Management** (Moderation, settings, automation)  
✅ **Educational Tools** (Dictionary, poetry, speech writing)  
✅ **Entertainment** (Games, memes, quotes, jokes)  
✅ **Developer Tools** (Code execution, encryption, URL shortening)  
✅ **Sports & News** (Live scores, weather, trending news)  
✅ **Customizable Settings** (Prefix, bot name, timezone, mode)  
✅ **Multi-language Support** (Translation across 100+ languages)  
✅ **Privacy Controls** (Read receipts, disappearing messages, block lists)  
✅ **Multi-Device Support** (Stays active even when phone is offline)  

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **Git**
- **WhatsApp Account** (for bot testing)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/adez-tech/adez-md.git
cd adez-md
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Edit the `.env` file with your settings:

```env
PREFIX=.
BOT_NAME=ADEZ-MD
OWNER_NUMBER=1234567890
MODE=public
TIMEZONE=UTC
```

### Step 5: Start the Bot

```bash
npm start
```

The bot will generate a QR code. Scan it with your WhatsApp to authenticate.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PREFIX` | Command prefix | `.` |
| `BOT_NAME` | Bot display name | `ADEZ-MD` |
| `OWNER_NUMBER` | Owner's WhatsApp number | Required |
| `MODE` | `public` or `private` | `public` |
| `TIMEZONE` | Bot timezone | `UTC` |
| `PACK_NAME` | Sticker pack name | `ADEZ-MD` |
| `AUTHOR_NAME` | Sticker author name | `Adez Tech` |
| `AUTO_READ` | Auto-read messages | `true` |
| `AUTO_LIKE_STATUS` | Auto-like status updates | `false` |
| `ANTI_DELETE` | Prevent message deletion | `false` |
| `SUPABASE_URL` | Supabase project URL | Optional |
| `SUPABASE_KEY` | Supabase API key | Optional |
| `PORT` | Server port | `10000` |

---

## 📖 Usage

### Basic Commands

**View all available commands:**
```
.menu
```

**Get help for a specific command:**
```
.help [command_name]
```

### Example Commands

**AI & Chat:**
```
.mistral What is machine learning?
.claudeai Write a poem about nature
.gpt List 5 programming tips
.deepseek Explain quantum computing
```

**Media & Downloads:**
```
.play song_name
.video movie_title
.tiktok [url]
.instagram [url]
.facebook [url]
.spotify [url]
```

**Image & Photo Effects:**
```
.imageedit [edit_type]
.anime [image]
.pixelglitch [image]
.cartoon [image]
```

**Group Management:**
```
.promote @user
.kick @user
.tagall message
.groupname New Name
.groupdesc New Description
```

**Tools & Utilities:**
```
.translate hello
.weather city_name
.ip google.com
.qrgenerator text
.encrypt secure_text
.ip 8.8.8.8
```

**Entertainment:**
```
.meme
.joke
.quote
.fact
.truth
.dare
```

**Audio Effects:**
```
.bass [audio_file]
.nightcore [audio_file]
.reverb [audio_file]
.echo [audio_file]
```

---

## 📂 Command Categories

### 🤖 **AI** (26 commands)
Mistral, Claude AI, Bard, Perplexity, O3, Copilot, Venice, Vision, ChatGPT, DeepSeek, Grok, Qwen AI, Meta AI, BlackBox, ILama, Gemini, Kieth AI, and more.

### 📚 **EDUCATION** (4 commands)
Speechwriter, Poem generator, Fruit identifier, Dictionary.

### ⛪ **RELIGION** (7 commands)
Muslim AI, Bible search, Quran audio, Surah list, Hymnal, Bible verses.

### 🛠️ **TOOLS** (14 commands)
Translation, IP lookup, QR code generator, Text-to-speech, Email generator, VCard, Inspect website.

### 🔍 **SEARCH** (10 commands)
Google, Brave, Weather, Movies, News, Lyrics, Image search, YouTube group search.

### ⬇️ **DOWNLOADER** (12 commands)
TikTok, Instagram, Facebook, Pinterest, Spotify, YouTube, Twitter, SoundCloud.

### 🎨 **EPHOTO** (42 commands)
1917, Comic, Dragon Ball, BlackPink, Naruto, Pixel Glitch, Underwater, Cartoon Style, Graffiti, Hologram, Hacker, Matrix, Halloween, Plasma, and 28+ more effects.

### 🎮 **SPORTS** (10 commands)
FIFA, Livescore, Top scorers, Standings, Upcoming matches, Player search, Team search, Venue search.

### 🎪 **FUN** (10 commands)
Games, Jokes, Memes, Quotes, Truth or Dare, Never Have I Ever, Quick Quiz, Paranoia.

### 👥 **GROUP** (45 commands)
Administration, Moderation, Settings, Announcements, Automation, Approve/Reject members.

### 🎵 **AUDIO-EDIT** (20 commands)
Bass boost, Reverb, Echo, Nightcore, Pitch control, Tempo, Speed up, Slow down, Effects.

### 🔧 **CODING** (18 commands)
Python execution, JavaScript, Java, C++ compilation, Encryption, Encoding, Base64, Hex, Binary.

### 📤 **UPLOADER** (12 commands)
Image/file upload to: Imgur, PostImage, AWS, Catbox, Uguu, Litterbox, and more.

### ⚙️ **SETTINGS** (30 commands)
Customize bot behavior, Privacy controls, Preferences, Notifications, Automation rules.

### 🎬 **CONVERTER** (9 commands)
Media format conversion, View-once messages, Audio/video compression, GIF creation.

### 📥 **SHORTENER** (3 commands)
Bitly, TinyURL, TinyUbe URL shortening.

### 🕵️ **STALKER** (5 commands)
Instagram stalker, TikTok stalker, Twitter stalker, YouTube stalker, Pinterest stalker.

### 🎥 **STICKER** (12 commands)
TGS, To Video, Take sticker, ATTP, ATTP2, Emoji mix, Sticker search, Brat video.

---

## 📁 Project Structure

```
adez-md/
├── commands/
│   ├── ai/
│   │   ├── mistral.js
│   │   ├── claudeai.js
│   │   └── ...
│   ├── education/
│   ├── tools/
│   ├── downloader/
│   ├── group/
│   ├── general/
│   └── menu.js
├── plugins/
│   └── message-handler.js
├── lib/
│   └── router.js
├── src/
│   └── menu_structure.js
├── auth/
│   └── (session files - auto-generated)
├── .env.example
├── .env
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Bot Configuration
PREFIX=.
BOT_NAME=ADEZ-MD
OWNER_NUMBER=YOUR_WHATSAPP_NUMBER
MODE=public

# Timezone
TIMEZONE=Africa/Nairobi

# Sticker Settings
PACK_NAME=ADEZ-MD
AUTHOR_NAME=Adez Tech

# Features
AUTO_READ=true
AUTO_LIKE_STATUS=false
ANTI_DELETE=false
ANTI_BOT=true
ANTI_LINK=false
ANTI_CALL=true

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-api-key

# Server
PORT=10000
NODE_ENV=production
```

---

## 🚀 Deployment

### Deploy to Render

1. Fork this repository to your GitHub account
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your forked repository
4. Set the **Build Command** to: `npm install`
5. Set the **Start Command** to: `node index.js`
6. Add environment variables in the dashboard
7. Deploy!

### Deploy to Railway

1. Push your repo to GitHub
2. Go to [Railway.app](https://railway.app) and sign up
3. Create a new project and select "Deploy from GitHub"
4. Select your repository
5. Add environment variables
6. Deploy and monitor logs

### Deploy Locally

```bash
npm install
node index.js
```

---

## 🐛 Troubleshooting

### Bot doesn't respond to commands

- ✅ Check that the prefix matches your `.env` file
- ✅ Ensure the command file exists in the `commands/` folder
- ✅ Verify the bot is running: `npm start`
- ✅ Check that the sender is not blocked

### QR Code not scanning

- ✅ Close the bot and delete the `auth/` folder
- ✅ Run `npm start` again and rescan the QR code
- ✅ Ensure your camera permissions are enabled

### Memory issues

- ✅ Clear old cache: `npm run clean`
- ✅ Restart the bot: `npm start`
- ✅ Monitor system resources

### Command not found error

- ✅ Check command name spelling
- ✅ Verify the command file exists
- ✅ Check `lib/router.js` for proper command registration
- ✅ Restart the bot with `npm start`

### Permission denied errors

- ✅ Run with elevated privileges: `sudo npm start`
- ✅ Check file permissions: `chmod +x start.sh`
- ✅ Verify bot admin status in groups

### Database connection failed

- ✅ Verify `SUPABASE_URL` is correct
- ✅ Ensure `SUPABASE_KEY` starts with lowercase `e`
- ✅ Check internet connection
- ✅ Remove database variables to use local storage

### Bot goes offline

- ✅ Check internet connection
- ✅ Restart bot: `npm start`
- ✅ Delete `auth/` folder and rescan QR code
- ✅ Check for WhatsApp updates

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Coding Standards

- Use ES6+ syntax
- Follow async/await patterns
- Add JSDoc comments for functions
- Test commands before submitting PR
- Follow existing code style

### Creating a New Command

1. Create a file in `commands/category/` folder
2. Export name, category, and description
3. Implement the `run()` function
4. Test locally before submitting

Example:
```javascript
export const name = 'mycommand';
export const category = 'General';
export const description = 'Does something awesome';

export async function run({ sock, from, m, sender, args }) {
  // Your command logic here
  await sock.sendMessage(from, { text: 'Hello!' }, { quoted: m });
}
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

### Need Help?

- 📧 **Email:** [adeztech1@gmail.com](mailto:adeztech1@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/adez-tech/adez-md/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/adez-tech/adez-md/discussions)
- 📱 **WhatsApp:** Contact via bot commands

### Join Our Community

- 🌐 **Website:** [@adeztech)
- 🐙 **GitHub:** [@adez-tech](https://github.com/adez-tech)
- 🔗 **Social:** Follow for updates and announcements

---

## ⭐ Show Your Support

If you found this project helpful, please give it a **⭐ Star** on GitHub!

---

## 🚀 Roadmap

- [x] Core bot functionality
- [x] 100+ commands
- [x] Dynamic menu system
- [ ] Web dashboard for bot management
- [ ] Database integration for user settings
- [ ] Advanced AI model integration
- [ ] Mobile app companion
- [ ] Real-time analytics
- [ ] Plugin marketplace
- [ ] Voice command support

---

## 📝 Changelog

### v1.0.0 (Current Release)
- 🎉 Initial public release
- ✨ 100+ commands across 24 categories
- 🎨 Cyber Neon Grid menu styling
- 👥 Full group management suite
- 🤖 AI model integrations
- 📱 Multi-device support
- 🗄️ Supabase integration

### v0.9.0 (Beta)
- Early access version
- Core functionality
- 50+ commands

---

## ⚠️ Disclaimer

**This bot is for educational purposes only.** Users are responsible for:
- Complying with WhatsApp's Terms of Service
- Complying with local and international laws
- Using the bot ethically and responsibly
- Not abusing or spamming users

**Unauthorized automation, spam, or abuse may result in WhatsApp account suspension.**

---

## 🙏 Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Node.js](https://nodejs.org) - JavaScript runtime
- All contributors and supporters

---

**Made with ❤️ by [Adez Tech](https://github.com/adez-tech)**

**Follow us for more awesome projects!**

**Last Updated:** July 2026

---

*Star ⭐ this repo if you find it useful!*
