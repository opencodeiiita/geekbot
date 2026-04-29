require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const { DISCORD_TOKEN, GUILD_ID } = process.env;

async function lookupChannel() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(DISCORD_TOKEN);
  console.log('Logged in to Discord');

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error('Guild not found');
    process.exit(1);
  }

  await guild.channels.fetch();
  const channel = guild.channels.cache.get('1452690296558194893');

  if (channel) {
    console.log(`Channel ID: ${channel.id}`);
    console.log(`Channel Name: ${channel.name}`);
    console.log(`Category Name: ${channel.parent?.name || 'No Category'}`);
    console.log(`Channel Type: ${channel.type}`);
  } else {
    console.log('Channel not found in the guild');
  }

  await client.destroy();
}

lookupChannel().catch(console.error);