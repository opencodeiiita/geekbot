/**
 * Finds repository links from database
 * @param {string} repoName - Repository full name
 * @returns {Array} - Array of repo links
 */
async function findRepoLinks(repoName) {
  const RepoLink = require('../models/repoLink');
  const repoKey = String(repoName).toLowerCase();

  // Prefer canonical match, fallback to legacy repoName match (case-insensitive) for existing DB entries.
  let links = await RepoLink.find({ repoKey });
  if (!links.length) {
    links = await RepoLink.find({
      repoName: new RegExp(`^${repoName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
  }

  return links;
}

/**
 * Creates role mentions string from role IDs
 * @param {Array<string>} mentionRoles - Array of role IDs
 * @returns {string} - Formatted role mentions
 */
function createRoleMentions(mentionRoles) {
  if (!mentionRoles || mentionRoles.length === 0) {
    return '';
  }

  return mentionRoles.map(roleId => `<@&${roleId}>`).join(' ') + ' ';
}

/**
 * Posts message to Discord channels
 * @param {Array} links - Repo links
 * @param {string} repoName - Repository name
 * @param {Object} embed - Discord embed object
 * @param {string} greetingMessage - Greeting message to send before embed
 * @param {Object} client - Discord client instance
 */
async function postToDiscordChannels(links, repoName, embed, greetingMessage = null, client) {
  for (const link of links) {
    try {
      const guild = client.guilds.cache.get(link.guildId);
      if (!guild) {
        console.error(`Guild ${link.guildId} not found for repo ${repoName}`);
        continue;
      }

      const channel = guild.channels.cache.get(link.channelId);
      if (!channel) {
        console.error(`Channel ${link.channelId} not found in guild ${link.guildId}`);
        continue;
      }

      // Send greeting message if provided
      if (greetingMessage) {
        await channel.send(greetingMessage);
      }

      // Send embed
      await channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(`Error posting to channel ${link.channelId}:`, error);
    }
  }
}

module.exports = {
  findRepoLinks,
  createRoleMentions,
  postToDiscordChannels,
};