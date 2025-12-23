require('dotenv').config();
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const RepoLink = require('./models/repoLink');

async function exportLinks() {
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

  // Fetch channels to ensure cache
  await guild.channels.fetch();
  console.log('Fetched channels');

  // Fetch all RepoLinks
  const links = await RepoLink.find({ guildId: guild.id });
  console.log(`Found ${links.length} repo links`);

  // Prepare data
  const data = [];
  for (const link of links) {
    const channel = guild.channels.cache.get(link.channelId);
    const channelName = channel ? channel.name : 'Unknown Channel';
    const categoryName = channel?.parent?.name || 'No Category';

    data.push({
      RepoName: link.repoName,
      ChannelName: channelName,
      CategoryName: categoryName,
      MentionRoles: link.mentionRoles.join(', '),
      LastChecked: link.lastChecked ? link.lastChecked.toISOString() : 'Never'
    });
  }

  // Write to CSV
  const csvHeader = 'RepoName,ChannelName,CategoryName,MentionRoles,LastChecked\n';
  const csvRows = data.map(row =>
    `"${row.RepoName}","${row.ChannelName}","${row.CategoryName}","${row.MentionRoles}","${row.LastChecked}"`
  ).join('\n');
  const csvContent = csvHeader + csvRows;

  const outputPath = path.join(__dirname, 'repo_links_export.csv');
  fs.writeFileSync(outputPath, csvContent);
  console.log(`Exported to ${outputPath}`);

  // Close connections
  await client.destroy();
  await mongoose.disconnect();
}

exportLinks().catch(console.error);