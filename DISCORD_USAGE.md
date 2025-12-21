# Discord Usage Guide for GeekBot

A comprehensive guide to using GeekBot in your Discord server for GitHub integration.

## Table of Contents

- [Getting Started](#-getting-started)
- [Commands](#-commands)
- [Events and Notifications](#-events-and-notifications)
- [Examples](#-examples)
- [Troubleshooting](#-troubleshooting)

## Getting Started

### Repository Registration

Link GitHub repositories to Discord channels using the `!register` command:

```
!register https://github.com/owner/repo #channel @role1 @role2
```

**Parameters:**
- `repo-url`: Full GitHub repository URL
- `channel`: Discord channel mention (e.g., #github-notifications)
- `roles`: Optional role mentions for notifications (e.g., @contributors @maintainers)

**Example:**
```
!register https://github.com/opencodeiiita/geekbot #github-notifications @contributors @maintainers
```

### Message Format

When an issue is created, the bot sends engaging notifications:

```
Hello Contributors! @contributors @maintainers

CODE RED – This function just pulled a 'it works on my machine' and now production is crying...

[Rich Embed with Issue Details]
```

## Commands

### Utility Commands

| Command | Description | Usage | Example |
|---------|-------------|-------|---------|
| `!register` | Link GitHub repo to Discord channel | `!register <repo-url> <channel> [roles...]` | `!register https://github.com/owner/repo #channel @role` |
| `!ping` | Check bot latency | `!ping` | `!ping` |
| `!server` | Display server information | `!server` | `!server` |
| `!user` | Display user information | `!user [@user]` | `!user @username` |

### Slash Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/reload` | Reload bot commands | `/reload` |
| `/leaderboard` | Display OpenCode leaderboard with pagination | `/leaderboard` |

## Events and Notifications

### Discord Events

| Event | Trigger | Action |
|-------|---------|--------|
| `guildMemberAdd` | New member joins | Sends welcome message with server info and role mentions |
| `messageCreate` | Message sent | Processes commands like `!register`, `!ping`, etc. |
| `interactionCreate` | Slash command used | Executes slash commands like `/reload` |

### GitHub Webhook Notifications

The bot sends rich Discord notifications for GitHub events:

#### Issues
- **Opened**: Rich embed with issue details, labels, assignee, and random engaging message
- **Closed**: Notification with closure reason and random message
- **Reopened**: Reopen notification with random message

#### Pull Requests
- **Opened**: Rich embed with PR details, branch info, and random message
- **Closed**: Notification with merge status and random message
- **Reopened**: Reopen notification with random message

### Notification Features

- **Rich Embeds**: Professional formatting with colors, images, and metadata
- **Role Mentions**: Automatic tagging of specified roles
- **Random Messages**: 400+ varied, meme-inspired announcements
- **Color Coding**: Different colors based on issue type and priority
- **Image Support**: Repository avatars and OpenGraph images (for public repos)

## Examples

### Basic Repository Registration
```
!register https://github.com/microsoft/vscode #dev-channel
```

### Registration with Role Mentions
```
!register https://github.com/facebook/react #react-updates @frontend-team @maintainers
```

### Multiple Roles
```
!register https://github.com/opencodeiiita/geekbot #notifications @contributors @core-team @mentors
```

### Bot Response Examples

**Issue Opened Notification:**
```
Hey @contributors!

BUG HUNT – A wild bug has appeared! Time to channel your inner exterminator...

**Issue #42: Fix login button styling**
Opened by @johndoe in opencodeiiita/geekbot

Labels: bug, frontend, high-priority
Assignee: @janedoe
Points: 5

[Rich embed with full details]
```

**Leaderboard Command:**
```
/leaderboard
```
**Bot Response:**
```
🏆 OpenCode Leaderboard
Page 1/5 • Total Participants: 47

🥇 #1 - John Doe
Score: 2500

🥈 #2 - Jane Smith
Score: 2350

🥉 #3 - Bob Johnson
Score: 2200

📊 #4 - Alice Brown
Score: 2100

[...showing 10 entries per page...]

[Previous] [1/5] [Next]  ← Interactive buttons for pagination
```

**Welcome Message:**
```
Welcome @newuser to the server!

We're excited to have you join our coding community!

**Getting Started:**
• Check out #rules for server guidelines
• Introduce yourself in #introductions
• Get help in #help-desk

**Resources:**
• Documentation: https://docs.example.com
• GitHub: https://github.com/org/repo
• Discord: https://discord.gg/example

**Roles:**
Don't forget to grab your roles in #role-selection!

*Enjoy your stay!*
```

## Troubleshooting

### Bot Not Responding to Commands

1. **Check Bot Status**: Ensure the bot is online in your server
2. **Permissions**: Verify bot has "Send Messages" and "Embed Links" permissions
3. **Channel Access**: Bot must have access to the target channel
4. **Command Format**: Use correct syntax (e.g., `!register url #channel`)
5. **Channel Restrictions**: Some commands like `/leaderboard` are only available in specific channels (#leaderboard🏆 and #bots🤖)

### Registration Issues

- **Invalid URL**: Must be a valid GitHub repository URL
- **Channel Not Found**: Use proper channel mention (#channel-name)
- **Role Not Found**: Ensure roles exist and are mentionable

### Notification Problems

- **No Notifications**: Check if repository is properly registered
- **Missing Mentions**: Verify role IDs are correct in database
- **Image Not Loading**: Private repositories can't load OpenGraph images

### Common Commands

```bash
# Test bot connectivity
!ping

# Check server info
!server

# Get user info
!user @username
```

---

**Need help?** Check the main [README.md](../README.md) for setup instructions or create an issue on GitHub.

*Last updated: December 21, 2025*