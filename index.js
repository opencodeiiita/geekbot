require('dotenv').config();
const fs = require('node:fs');
const express = require('express');
const path = require('node:path');
const mongoose = require('mongoose');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN, MONGODB_URI,PORT } = process.env;
const webhookHandler = require('./handlers/webhookHandler');

//mongoose connection
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


//story binary buffer before parsing for signature verify
const app = express();
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

app.post('/api/v1/discord-bot', webhookHandler(client));
app.post('/back/api/v1/discord-bot', webhookHandler(client));

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

client.login(DISCORD_TOKEN);

app.listen(PORT || 3001, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});