require('dotenv').config();
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');

const RepoLink = require('./models/repoLink');

async function cleanLinks() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create Discord client
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(process.env.DISCORD_TOKEN);
  console.log('Logged in to Discord');

  // Get guild
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) {
    console.error('Guild not found');
    process.exit(1);
  }

  // Fetch channels
  await guild.channels.fetch();

  // Fetch all RepoLinks
  const links = await RepoLink.find({ guildId: guild.id });
  console.log(`Found ${links.length} repo links`);

  let deletedCount = 0;
  for (const link of links) {
    const channel = guild.channels.cache.get(link.channelId);
    const channelName = channel ? channel.name : 'Unknown';
    if (channelName !== 'announcement') {
      await RepoLink.deleteOne({ _id: link._id });
      console.log(`Deleted link for repo ${link.repoName} in channel ${channelName}`);
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} links. Kept links in 'announcement' channel.`);

  // Close connections
  await client.destroy();
  await mongoose.disconnect();
}

cleanLinks().catch(console.error);