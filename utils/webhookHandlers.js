const { findRepoLinks, createRoleMentions, postToDiscordChannels } = require('./discordUtils');
const { extractPointsFromLabels, determineIssueType, getEmbedColor, truncateDescription } = require('./githubUtils');
const { getIssueMessages } = require('./issueMessages');

/**
 * Handles GitHub issue opened events
 * @param {Object} payload - GitHub webhook payload
 * @param {Object} client - Discord client instance
 */
async function handleIssueOpened(payload, client) {
  const repoName = payload.repository.full_name;
  const item = payload.issue;

  const links = await findRepoLinks(repoName);
  if (!links.length) {
    console.log(`No repository links found for ${repoName}`);
    return;
  }

  // Extract and process labels
  const labels = item.labels.map(l => l.name);
  const labelsText = labels.length > 0 ? labels.join(', ') : 'None';

  const { points, pointsValue } = extractPointsFromLabels(labels);
  const type = determineIssueType(labels);
  const color = getEmbedColor(pointsValue);
  const description = truncateDescription(item.body);

  // Create embed
  const embed = {
    author: {
      name: item.user.login,
      icon_url: item.user.avatar_url,
      url: item.user.html_url,
    },
    title: `Issue #${item.number}`,
    url: item.html_url,
    description: `**${item.title}**\n\n${description}`,
    color: color,
    fields: [
      { name: 'Repository', value: `[${payload.repository.full_name}](${payload.repository.html_url})`, inline: true },
      { name: 'Labels', value: labelsText, inline: true },
      { name: 'Points', value: points, inline: true },
      { name: 'Type', value: type, inline: true },
      { name: 'State', value: item.state, inline: true },
    ],
    image: {
      url: `https://opengraph.githubassets.com/1/${payload.repository.full_name}/issues/${item.number}`,
    },
    footer: {
      text: 'Created',
    },
    timestamp: item.created_at,
  };

  // Get random announcement message
  const availableMessages = getIssueMessages(labels, pointsValue);
  const randomMsg = availableMessages[Math.floor(Math.random() * availableMessages.length)];

  // Create greeting message with role mentions
  for (const link of links) {
    const roleMentions = createRoleMentions(link.mentionRoles);
    const greetingMessage = `👋 Hello Contributors! ${roleMentions}\n\n${randomMsg}`;

    await postToDiscordChannels([link], repoName, embed, greetingMessage, client);
  }
}

/**
 * Handles GitHub pull request opened events
 * @param {Object} payload - GitHub webhook payload
 * @param {Object} client - Discord client instance
 */
async function handlePullRequestOpened(payload, client) {
  const repoName = payload.repository.full_name;
  const item = payload.pull_request;

  const links = await findRepoLinks(repoName);
  if (!links.length) {
    console.log(`No repository links found for ${repoName}`);
    return;
  }

  const embed = {
    title: `Pull Request #${item.number}`,
    url: item.html_url,
    description: item.title,
    fields: [
      { name: 'State', value: item.state, inline: true },
      { name: 'Created by', value: item.user.login, inline: true },
    ],
    timestamp: item.created_at,
  };

  await postToDiscordChannels(links, repoName, embed, null, client);
}

module.exports = {
  handleIssueOpened,
  handlePullRequestOpened,
};