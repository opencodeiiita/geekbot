require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const express = require('express');
const crypto = require('crypto');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN, MONGODB_URI, GITHUB_WEBHOOK_SECRET } = process.env;

console.log('GITHUB_WEBHOOK_SECRET loaded:', !!GITHUB_WEBHOOK_SECRET, GITHUB_WEBHOOK_SECRET ? 'Present' : 'Missing');
const RepoLink = require('./models/repoLink');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Express app for webhooks
const app = express();
app.use(express.json());

// Webhook endpoint
app.post('/back/api/v1/github-bot', async (req, res) => {
  console.log('🔗 Webhook received!');
  const payload = req.body;
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];

  console.log(`Event: ${event}, Action: ${payload.action}, Repo: ${payload.repository?.full_name}`);

  // Verify signature
  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = 'sha256=' + hmac.digest('hex');

  if (signature !== expectedSignature) {
    console.log('❌ Invalid webhook signature');
    return res.status(401).send('Unauthorized');
  }

  if ((event === 'issues' || event === 'pull_request') && payload.action === 'opened') {
    const repoName = payload.repository.full_name;
    console.log(`Processing opened ${event} for repo: ${repoName}`);
    const item = payload[event === 'issues' ? 'issue' : 'pull_request'];

    const link = await RepoLink.findOne({ repoName });

    if (link) {
      console.log(`✅ Found link for repo ${repoName}, posting to channel ${link.channelId}`);
      const guild = client.guilds.cache.get(link.guildId);
      if (guild) {
        const channel = guild.channels.cache.get(link.channelId);
        if (channel) {
          const embed = {
            title: `${event === 'issues' ? 'Issue' : 'Pull Request'} #${item.number}`,
            url: item.html_url,
            description: item.title,
            fields: [
              { name: 'State', value: item.state, inline: true },
              { name: 'Created by', value: item.user.login, inline: true },
            ],
            timestamp: item.created_at,
          };
          await channel.send({ embeds: [embed] });
          console.log(`📤 Posted embed for ${item.number} in ${channel.name}`);
        } else {
          console.log('❌ Channel not found');
        }
      } else {
        console.log('❌ Guild not found');
      }
    } else {
      console.log(`❌ No link found for repo ${repoName}`);
    }
  } else {
    console.log(`ℹ️ Ignoring event: ${event} with action: ${payload.action}`);
  }

  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});

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
