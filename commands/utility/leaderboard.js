const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Cache for leaderboard data
let leaderboardCache = {
  data: null,
  timestamp: 0,
  cacheDuration: 10 * 60 * 1000 // 10 minutes in milliseconds
};

// Allowed channels
const ALLOWED_CHANNELS = ['1184746712351395850', '1184783944378495046'];

async function fetchLeaderboardData() {
  const axios = require('axios');

  const now = Date.now();

  // Check if cache is still valid
  if (leaderboardCache.data && (now - leaderboardCache.timestamp) < leaderboardCache.cacheDuration) {
    return leaderboardCache.data;
  }

  try {
    console.log('Fetching leaderboard data from API...');
    const response = await axios.get('https://events.geekhaven.in/back/api/v1/events/Opencode/leaderboard', {
      timeout: 10000,
      headers: {
        'User-Agent': 'GeekBot/1.0 (Discord Bot for OpenCode)'
      }
    });

    const leaderboardData = response.data;

    // The API returns data wrapped in an object: { status, message, data: [...] }
    const leaderboard = leaderboardData.data.map((participant, index) => ({
      rank: participant.position,
      name: participant.name || participant.githubid, // Use name if available, fallback to githubid
      score: participant.points,
      githubid: participant.githubid,
      prmerged: participant.prmerged,
      avatarUrl: participant.avatarUrl,
      position: index + 1
    }));

    // Sort by rank if not already sorted
    leaderboard.sort((a, b) => a.rank - b.rank);

    // Update cache
    leaderboardCache.data = leaderboard;
    leaderboardCache.timestamp = now;

    console.log(`Fetched ${leaderboard.length} leaderboard entries from API`);
    return leaderboard;

  } catch (error) {
    console.error('Error fetching leaderboard from API:', error.message);
    throw new Error('Failed to fetch leaderboard data from API. Please try again later.');
  }
}

function createLeaderboardEmbed(leaderboard, page = 1, totalPages = 1) {
  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageEntries = leaderboard.slice(startIndex, endIndex);

  const embed = new EmbedBuilder()
    .setTitle('🏆 OpenCode Leaderboard')
    .setDescription(`Page ${page}/${totalPages} • Total Participants: ${leaderboard.length}`)
    .setColor(0x00ff00)
    .setTimestamp()
    .setFooter({ text: 'Data updates every 10 minutes' });

  if (pageEntries.length === 0) {
    embed.setDescription('No leaderboard data available.');
    return embed;
  }

  // Add leaderboard entries
  const fields = pageEntries.map((entry, index) => {
    const position = startIndex + index + 1;
    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '📊';

    return {
      name: `${medal} #${position} - ${entry.name}`,
      value: `Score: **${entry.score}**`,
      inline: false
    };
  });

  embed.addFields(fields);
  return embed;
}

function createNavigationButtons(currentPage, totalPages) {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`leaderboard_prev_${Date.now()}`) // Add timestamp to make unique
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1),

      new ButtonBuilder()
        .setCustomId(`leaderboard_page_${Date.now()}`)
        .setLabel(`${currentPage}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId(`leaderboard_next_${Date.now()}`)
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages)
    );

  return row;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Display OpenCode leaderboard with pagination'),

  async execute(interaction) {
    // Check if command is used in allowed channels
    if (!ALLOWED_CHANNELS.includes(interaction.channelId)) {
      const allowedChannelNames = ALLOWED_CHANNELS.map(id => `<#${id}>`).join(' or ');
      return await interaction.reply({
        content: `❌ This command can only be used in ${allowedChannelNames}`,
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true }); // Make the response ephemeral

    try {
      const leaderboard = await fetchLeaderboardData();

      if (!leaderboard || leaderboard.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('🏆 OpenCode Leaderboard')
              .setDescription('❌ **Leaderboard data is currently unavailable**\n\nThe leaderboard website uses JavaScript to load data dynamically, which cannot be scraped by traditional methods.\n\n📊 **To view the leaderboard:**\n• Visit: https://events.geekhaven.in/user/leaderboard/Opencode\n• Check the website directly for live rankings\n\n🔄 Data will be refreshed automatically when available.')
              .setColor(0xff6b6b)
              .setFooter({ text: 'GeekBot - OpenCode Leaderboard' })
          ]
        });
      }

      const totalPages = Math.ceil(leaderboard.length / 10);
      const embed = createLeaderboardEmbed(leaderboard, 1, totalPages);
      const buttons = createNavigationButtons(1, totalPages);

      await interaction.editReply({
        embeds: [embed],
        components: totalPages > 1 ? [buttons] : []
      });

    } catch (error) {
      console.error('Leaderboard command error:', error);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription('Failed to load leaderboard. Please try again later.')
            .setColor(0xff0000)
        ]
      });
    }
  },

  // Export helper functions for button interactions
  createLeaderboardEmbed,
  createNavigationButtons,
  fetchLeaderboardData
};