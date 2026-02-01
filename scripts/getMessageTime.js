const axios = require('axios');
require('dotenv').config();

/**
 * Get message timestamp from a URL
 * Supports GitHub issue comments and Discord messages (requires auth for Discord)
 * @param {string} url - The URL of the message
 * @param {string} discordToken - Discord bot token (optional, reads from env if not provided)
 */
async function getMessageTime(url, discordToken = process.env.DISCORD_TOKEN) {
  try {
    if (url.includes('github.com') && url.includes('issuecomment-')) {
      // GitHub comment
      const commentId = url.split('issuecomment-')[1];
      const issueMatch = url.match(/issues\/(\d+)/);
      if (!issueMatch) throw new Error('Invalid GitHub issue URL');
      const issueNumber = issueMatch[1];
      const repoMatch = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (!repoMatch) throw new Error('Invalid GitHub URL');
      const repo = repoMatch[1];

      const apiUrl = `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`;
      const response = await axios.get(apiUrl);
      const comment = response.data.find(c => c.id.toString() === commentId);
      if (!comment) throw new Error('Comment not found');
      return comment.created_at;
    } else if (url.includes('discord.com/channels/')) {
      // Discord message
      if (!discordToken) throw new Error('Discord token required for Discord URLs');

      const parts = url.split('/channels/')[1].split('/');
      if (parts.length < 3) throw new Error('Invalid Discord URL');
      const guildId = parts[0];
      const channelId = parts[1];
      const messageId = parts[2];

      const apiUrl = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bot ${discordToken}`
        }
      });
      return response.data.timestamp;
    } else {
      throw new Error('Unsupported URL type');
    }
  } catch (error) {
    console.error('Error fetching message time:', error.message);
    return null;
  }
}

// Convert UTC timestamp to IST
function convertToIST(utcTimestamp) {
  const date = new Date(utcTimestamp);
  // IST is UTC+5:30
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);
  return date.toISOString().replace('Z', '+05:30');
}

// Example usage
if (require.main === module) {
  const url = process.argv[2];
  const token = process.argv[3]; // For Discord
  if (!url) {
    console.log('Usage: node getMessageTime.js <url> [discord_token]');
    process.exit(1);
  }
  getMessageTime(url, token).then(time => {
    if (time) {
      const istTime = convertToIST(time);
      console.log('Message timestamp (UTC):', time);
      console.log('Message timestamp (IST):', istTime);
    } else {
      console.log('Failed to get timestamp');
    }
  });
}

module.exports = { getMessageTime };
