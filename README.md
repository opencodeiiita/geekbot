# GeekBot - Discord GitHub Integration Bot

A sophisticated Discord bot that bridges GitHub webhooks with Discord notifications, providing rich embeds, role-based mentions, and engaging community interactions.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [GitHub Webhook Setup](#-github-webhook-setup)
- [Discord Bot Setup](#-discord-bot-setup)
- [Usage](#-usage)
- [Commands](#-commands)
- [Events](#-events)
- [API Endpoints](#-api-endpoints)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **GitHub Webhook Integration**: Real-time notifications for issues and pull requests
- **Rich Discord Embeds**: Professional-looking notifications with issue details, labels, and metadata
- **Role-Based Mentions**: Tag specific roles when issues are created
- **Multi-Repository Support**: Connect multiple GitHub repositories to different Discord channels
- **Secure Webhook Verification**: HMAC-SHA256 signature validation for security

### 🎨 User Experience
- **Engaging Messages**: 400+ randomized, meme-inspired announcement messages
- **Welcome System**: Automated welcome messages for new server members
- **Interactive Commands**: Slash commands and traditional prefix commands
- **Visual Feedback**: Color-coded embeds based on issue priority and type

### � Technical Features
- **MongoDB Integration**: Persistent storage for repository-channel mappings
- **Express Server**: Robust webhook handling with raw body parsing
- **Error Handling**: Comprehensive logging and graceful failure recovery
- **Modular Architecture**: Clean separation of concerns with utilities and events

## 📋 Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **MongoDB**: Local installation or cloud service (MongoDB Atlas)
- **GitHub Account**: With repository access
- **Discord Account**: With server administrator privileges

### System Requirements
- **RAM**: 512MB minimum, 1GB recommended
- **Storage**: 100MB for bot files + database
- **Network**: Stable internet connection for webhook delivery

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/opencodeiiita/geekbot.git
cd geekbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DISCORD_TOKEN=your_discord_bot_token_here
MONGODB_URI=mongodb://localhost:27017/geekbot
WEBHOOK_SECRET=your_github_webhook_secret_here
PORT=3001
```

### 4. Database Initialization
```bash
# MongoDB should be running locally or use a cloud service
mongosh # or mongo
use geekbot
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DISCORD_TOKEN` | Discord bot token from Developer Portal | ✅ | `MTEwMDAwMDAwMDAwMDAwMDAw.MEowL` |
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb://localhost:27017/geekbot` |
| `WEBHOOK_SECRET` | GitHub webhook secret for verification | ✅ | `your-secret-key-here` |
| `PORT` | Server port for webhook endpoint | ❌ | `3001` |

### Bot Permissions

The bot requires the following Discord permissions:
- **Send Messages**
- **Embed Links**
- **Mention Everyone** (for role mentions)
- **Read Message History**
- **Use Slash Commands**

## 🗄️ Database Setup

### MongoDB Schema

The bot uses a single collection `repolinks` with the following schema:

```javascript
{
  guildId: String,      // Discord server ID
  repoKey: String,      // Lowercase "owner/repo" format
  repoName: String,     // Original repository name
  channelId: String,    // Discord channel ID for notifications
  mentionRoles: [String], // Array of role IDs to mention
  lastChecked: Date     // Timestamp of last activity
}
```

### Database Commands
```javascript
// Connect to MongoDB
use geekbot

// View all repository links
db.repolinks.find()

// Remove a repository link
db.repolinks.deleteOne({ repoKey: "owner/repo" })
```

## 🔗 GitHub Webhook Setup

### 1. Repository Webhook Configuration

1. Go to your GitHub repository → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Configure the following:

| Field | Value |
|-------|-------|
| **Payload URL** | `https://your-domain.com/api/v1/discord-bot` |
| **Content type** | `application/json` |
| **Secret** | Your webhook secret (same as `.env` file) |
| **Events** | Select: `Issues`, `Pull requests` |

### 2. Webhook Events

The bot responds to:
- `issues.opened`
- `issues.closed`
- `issues.reopened`
- `pull_request.opened`
- `pull_request.closed`
- `pull_request.reopened`

### 3. Security Verification

The bot uses HMAC-SHA256 to verify webhook authenticity:
```javascript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');
```

## 🤖 Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Give your bot a name (e.g., "GeekBot")

### 2. Bot Configuration

1. Go to **Bot** section
2. Click **Add Bot**
3. Copy the **Token** (this is your `DISCORD_TOKEN`)
4. Enable **Message Content Intent** (under Privileged Gateway Intents)

### 3. Invite Bot to Server

Generate an invite URL with the following permissions:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=414464658496&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your application's client ID.

## 📖 Usage

### Repository Registration

Use the `!register` command to link GitHub repositories:

```
!register https://github.com/owner/repo #channel @role1 @role2
```

**Example:**
```
!register https://github.com/opencodeiiita/geekbot #github-notifications @contributors @maintainers
```

### Message Format

When an issue is created, the bot sends:

```
👋 Hello Contributors! @contributors @maintainers

🚨 CODE RED – This function just pulled a 'it works on my machine' and now production is crying...

[Rich Embed with Issue Details]
```

## 🛠️ Commands

### Utility Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!register` | Link GitHub repo to Discord channel | `!register <repo-url> <channel> [roles...]` |
| `!ping` | Check bot latency | `!ping` |
| `!server` | Display server information | `!server` |
| `!user` | Display user information | `!user [@user]` |

### Slash Commands

| Command | Description |
|---------|-------------|
| `/reload` | Reload bot commands |
| `/test-welcome` | Test welcome message |

## 📡 Events

### Discord Events

| Event | Trigger | Action |
|-------|---------|--------|
| `ready` | Bot starts | Logs connection status |
| `guildMemberAdd` | New member joins | Sends welcome message |
| `messageCreate` | Message sent | Processes commands |
| `interactionCreate` | Slash command used | Executes command |

### GitHub Events

| Event | Action |
|-------|--------|
| `issues.opened` | Creates rich embed notification |
| `issues.closed` | Sends closure notification |
| `issues.reopened` | Sends reopen notification |
| `pull_request.opened` | Creates PR embed notification |
| `pull_request.closed` | Sends PR closure notification |
| `pull_request.reopened` | Sends PR reopen notification |

## 🌐 API Endpoints

### Webhook Endpoint
```
POST /api/v1/discord-bot
```

**Headers:**
- `X-GitHub-Event`: Event type (issues, pull_request)
- `X-Hub-Signature-256`: HMAC signature for verification

**Body:** GitHub webhook payload (JSON)

### Alternative Endpoints
```
POST /back/api/v1/discord-bot  # Alternative routing
```

## 💻 Development

### Project Structure
```
geekbot/
├── index.js              # Main bot file
├── commands/             # Discord slash commands
├── events/               # Discord event handlers
├── models/               # MongoDB schemas
├── utils/                # Utility functions and helpers
├── config/               # Configuration files
│   ├── .env.example      # Environment variables template
│   └── eslint.config.js  # ESLint configuration
├── scripts/              # Utility scripts and tools
├── docs/                 # Documentation files
│   ├── README.md         # This file
│   └── DISCORD_USAGE.md  # Usage documentation
└── data/                 # Data files and exports
```

### Running in Development
```bash
# Install dependencies
npm install

# Start the bot
npm start

# Start with auto-reload (Node.js 18.11+)
npm run dev

# Deploy slash commands
npm run deploy-commands

# Export repository links
npm run export-links

# Convert CSV to PDF
npm run convert-csv-pdf
```

### Code Style
The project uses ESLint for code quality:
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Adding New Features

1. **Commands**: Add to `commands/utility/`
2. **Events**: Add to `events/` directory
3. **Messages**: Modify `utils/issueMessages.js`
4. **Database**: Update `models/` schemas

## 🔧 Troubleshooting

### Common Issues

#### Bot Not Responding
```bash
# Check if bot is running
ps aux | grep node

# Check logs for errors
tail -f logs/bot.log

# Verify Discord token
echo $DISCORD_TOKEN
```

#### Webhook Not Working
```bash
# Test webhook endpoint
curl -X POST http://localhost:3001/api/v1/discord-bot \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check webhook secret
echo $WEBHOOK_SECRET
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongosh --eval "db.runCommand({ping: 1})"

# Check connection string
echo $MONGODB_URI
```

#### Image Not Loading in Embeds
- **Public repos**: Images work automatically
- **Private repos**: OpenGraph service cannot access private content
- **Solution**: Images are optional; embeds work without them

### Debug Mode
Enable verbose logging by setting:
```env
DEBUG=geekbot:*
```

### Performance Optimization
- **Database indexing**: Ensure `repoKey` is indexed
- **Rate limiting**: Implement webhook rate limiting for high-traffic repos
- **Caching**: Cache frequently accessed data

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

### Code Standards
- Use ESLint configuration
- Follow conventional commit messages
- Add JSDoc comments for new functions
- Test all new features

### Testing
```bash
# Run test suite
npm test

# Run specific tests
npm run test:unit
npm run test:integration
```

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Discord.js**: Powerful Discord API wrapper
- **Express**: Robust web framework
- **MongoDB**: Flexible NoSQL database
- **GitHub**: Excellent webhook system
- **Open Source Community**: Inspiration and support

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/opencodeiiita/geekbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/opencodeiiita/geekbot/discussions)
- **Documentation**: This README

---

**Built with ❤️ for the open source community**

*Last updated: December 21, 2025*
