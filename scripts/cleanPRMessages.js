require('dotenv').config();
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');

const RepoLink = require('./models/repoLink');

async function cleanPRMessages() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create Discord client
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

  // Wait for client to be ready
  await new Promise((resolve) => {
    client.once('ready', resolve);
    client.login(process.env.DISCORD_TOKEN);
  });

  console.log('Logged in to Discord');

  // Fetch all RepoLinks
  const links = await RepoLink.find({});
  console.log(`Found ${links.length} repo links`);

  let deletedCount = 0;

  for (const link of links) {
    const guild = client.guilds.cache.get(link.guildId);
    if (!guild) {
      console.log(`Guild ${link.guildId} not found`);
      continue;
    }

    const channel = guild.channels.cache.get(link.channelId);
    if (!channel) {
      console.log(`Channel ${link.channelId} not found in guild ${guild.name}`);
      continue;
    }

    console.log(`Checking channel ${channel.name} in guild ${guild.name}`);

    try {
      // Fetch messages from the channel (last 100 for safety, can adjust)
      const messages = await channel.messages.fetch({ limit: 100 });

      for (const [messageId, message] of messages) {
        // Check if the message is from the bot and has PR embed
        if (message.author.id === client.user.id && message.embeds.length > 0) {
          const embed = message.embeds[0];
          if (embed.title && embed.title.startsWith('Pull Request #')) {
            await message.delete();
            console.log(`Deleted PR message: ${embed.title} in ${channel.name}`);
            deletedCount++;
            // Add a small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    } catch (error) {
      console.error(`Error processing channel ${channel.name}:`, error);
    }
  }

  console.log(`Deleted ${deletedCount} PR messages.`);

  // Close connections
  await client.destroy();
  await mongoose.disconnect();
}

cleanPRMessages().catch(console.error);