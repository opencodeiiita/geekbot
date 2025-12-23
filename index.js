require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const express = require('express');
const crypto = require('crypto');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN, MONGODB_URI, WEBHOOK_SECRET } = process.env;

console.log('WEBHOOK_SECRET loaded:', !!WEBHOOK_SECRET, WEBHOOK_SECRET ? 'Present' : 'Missing');
const RepoLink = require('./models/repoLink');
const { getIssueMessages } = require('./utils/issueMessages');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Express app for webhooks
const app = express();

// Capture the raw request body for GitHub signature verification.
// GitHub computes the signature over the exact raw bytes, not JSON.stringify(req.body).
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));

function verifyGithubSignature(req) {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    return { ok: false, status: 401, msg: 'Unauthorized' };
  }
  if (!WEBHOOK_SECRET) {
    return { ok: false, status: 500, msg: 'Server misconfigured' };
  }

  const computedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(req.rawBody || Buffer.from(''))
    .digest('hex');

  const expected = Buffer.from(`sha256=${computedSignature}`, 'ascii');
  const actual = Buffer.from(String(signature), 'ascii');

  if (expected.length !== actual.length) {
    return { ok: false, status: 401, msg: 'Unauthorized' };
  }

  if (!crypto.timingSafeEqual(expected, actual)) {
    return { ok: false, status: 401, msg: 'Unauthorized' };
  }

  return { ok: true };
}

async function webhookHandler(req, res) {
  console.log('🔗 Webhook received!');
  const payload = req.body || {};
  const event = req.headers['x-github-event'];

  console.log(`Event: ${event}, Action: ${payload.action}, Repo: ${payload.repository?.full_name}`);

  const signatureResult = verifyGithubSignature(req);
  if (!signatureResult.ok) {
    if (signatureResult.status === 401) {
      console.log('❌ Invalid or missing webhook signature');
    } else {
      console.log('❌ Webhook server misconfigured (missing WEBHOOK_SECRET)');
    }
    return res.status(signatureResult.status).send(signatureResult.msg);
  }

  // Use the router function logic adapted for Discord bot
  switch (event) {
    case 'issues':
      switch (payload.action) {
        case 'opened':
          await handleIssueOpened(payload, res);
          break;
        case 'closed':
          console.log(`Issue #${payload.issue.number} closed in ${payload.repository.full_name}`);
          break;
        case 'reopened':
          console.log(`Issue #${payload.issue.number} reopened in ${payload.repository.full_name}`);
          break;
        // Add more cases as needed
        default:
          return res.status(200).json();
      }
      break;
    case 'pull_request':
      switch (payload.action) {
        case 'opened':
          await handlePullRequestOpened(payload, res);
          break;
        case 'closed':
          if (payload.pull_request.merged) {
            console.log(`PR #${payload.pull_request.number} merged in ${payload.repository.full_name}`);
          } else {
            console.log(`PR #${payload.pull_request.number} closed in ${payload.repository.full_name}`);
          }
          break;
        case 'reopened':
          console.log(`PR #${payload.pull_request.number} reopened in ${payload.repository.full_name}`);
          break;
        // Add more cases as needed
        default:
          return res.status(200).json();
      }
      break;
    default:
      return res.status(200).json();
  }

  res.status(200).send('OK');
}

// Webhook endpoints (support both direct and /back-prefixed routing)
app.post('/api/v1/discord-bot', webhookHandler);
app.post('/back/api/v1/discord-bot', webhookHandler);

async function handleIssueOpened(payload) {
  const repoName = payload.repository.full_name;
  const repoKey = String(repoName).toLowerCase();
  const item = payload.issue;

  // Prefer canonical match, fallback to legacy repoName match (case-insensitive) for existing DB entries.
  let links = await RepoLink.find({ repoKey });
  if (!links.length) {
    links = await RepoLink.find({ repoName: new RegExp(`^${repoName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  }

  if (!links.length) {
    console.log(`❌ No link found for repo ${repoName} (key: ${repoKey})`);
    return;
  }

  // Extract labels
  const labels = item.labels.map(l => l.name);
  const labelsText = labels.length > 0 ? labels.join(', ') : 'None';

  // Extract points from labels (e.g., "points: 10")
  let points = 'Not specified';
  let pointsValue = 0;
  for (const label of labels) {
    const match = label.match(/points:\s*(\d+)/i);
    if (match) {
      points = match[1];
      pointsValue = parseInt(match[1], 10);
      break;
    }
  }

  // Determine type based on labels
  let type = 'FCFS (First come first serve)';
  if (labels.some(l => l.toLowerCase().includes('ofa') || l.toLowerCase().includes('open-for-all'))) {
    type = 'Open for all';
  } else if (labels.some(l => l.toLowerCase().includes('compe') || l.toLowerCase().includes('competitive'))) {
    type = 'Competitive';
  }

  // Determine embed color based on points (higher points = more important color)
  // Default green
  let color = 0x00ff00;
  // Red for very high points
  if (pointsValue >= 31) {
    color = 0xff0000;
  // Orange for high points
  } else if (pointsValue >= 21) {
    color = 0xffa500;
  // Yellow for medium points
  } else if (pointsValue >= 11) {
    color = 0xffff00;
  }

  // Truncate description to max 5 lines
  let description = item.body || 'No description provided.';
  const lines = description.split('\n');
  if (lines.length > 5) {
    description = lines.slice(0, 5).join('\n') + '\n...';
  }

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
      { name: 'Labels', value: labelsText || 'None', inline: true },
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

  for (const link of links) {
    console.log(`✅ Found link for repo ${repoName}, posting to channel ${link.channelId} (guild ${link.guildId})`);
    const guild = client.guilds.cache.get(link.guildId);
    if (!guild) {
      console.log('❌ Guild not found');
      continue;
    }
    const channel = guild.channels.cache.get(link.channelId);
    if (!channel) {
      console.log('❌ Channel not found');
      continue;
    }

    // Pick a random announcement message based on issue characteristics
    const availableMessages = getIssueMessages(labels, pointsValue);
    const randomMsg = availableMessages[Math.floor(Math.random() * availableMessages.length)];

    // Create role mentions
    let roleMentions = '';
    if (link.mentionRoles && link.mentionRoles.length > 0) {
      roleMentions = link.mentionRoles.map(roleId => `<@&${roleId}>`).join(' ') + ' ';
    }

    // Send greeting and announcement in one message
    await channel.send(`👋 Hello Contributors! ${roleMentions}\n\n${randomMsg}`);

    // Send the embed
    await channel.send({ embeds: [embed] });
    console.log(`📤 Posted issue ${item.number} in ${channel.name}`);
  }
}

async function handlePullRequestOpened(payload) {
  const repoName = payload.repository.full_name;
  const repoKey = String(repoName).toLowerCase();
  const item = payload.pull_request;

  // Prefer canonical match, fallback to legacy repoName match (case-insensitive) for existing DB entries.
  let links = await RepoLink.find({ repoKey });
  if (!links.length) {
    links = await RepoLink.find({ repoName: new RegExp(`^${repoName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  }

  if (!links.length) {
    console.log(`❌ No link found for repo ${repoName} (key: ${repoKey})`);
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

  for (const link of links) {
    console.log(`✅ Found link for repo ${repoName}, posting to channel ${link.channelId} (guild ${link.guildId})`);
    const guild = client.guilds.cache.get(link.guildId);
    if (!guild) {
      console.log('❌ Guild not found');
      continue;
    }
    const channel = guild.channels.cache.get(link.channelId);
    if (!channel) {
      console.log('❌ Channel not found');
      continue;
    }
    await channel.send({ embeds: [embed] });
    console.log(`📤 Posted embed for PR ${item.number} in ${channel.name}`);
  }
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// creating a cooldown collection
client.cooldowns = new Collection();

// reading all of the slash commands from the commands/ directory
// then activating them
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// reading all of the events from the event/ directory
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Log in to Discord with your client's DISCORD_TOKEN
client.login(DISCORD_TOKEN);

// Start the Express server for webhooks
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
