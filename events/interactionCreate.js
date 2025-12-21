const { Events, MessageFlags, Collection } = require('discord.js');

const ADMIN_ROLE_NAMES = new Set(['mentor', 'admin', 'server manager']);

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle button interactions for leaderboard
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('leaderboard_')) {
        await handleLeaderboardButton(interaction);
        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    // Role-gate admin commands
    if (command.adminOnly) {
      if (!interaction.inGuild()) {
        return interaction.reply({
          content: 'This command can only be used in a server.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const member = interaction.member;
      const hasAllowedRole =
        member?.roles?.cache?.some((role) => ADMIN_ROLE_NAMES.has(role.name.toLowerCase())) ?? false;

      if (!hasAllowedRole) {
        return interaction.reply({
          content: 'You need the Mentor, Admin, or Server manager role to use this command.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    // checking for cooldowns
    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 10;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;
    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // main command event

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

// Handle leaderboard button interactions
async function handleLeaderboardButton(interaction) {
  const { createLeaderboardEmbed, createNavigationButtons, fetchLeaderboardData } = require('../commands/utility/leaderboard');

  try {
    await interaction.deferUpdate();

    const leaderboard = await fetchLeaderboardData();
    if (!leaderboard || leaderboard.length === 0) {
      return await interaction.editReply({
        content: 'No leaderboard data available.',
        embeds: [],
        components: []
      });
    }

    const totalPages = Math.ceil(leaderboard.length / 10);
    let currentPage = 1;

    // Extract current page from embed description
    const embed = interaction.message.embeds[0];
    if (embed && embed.description) {
      const pageMatch = embed.description.match(/Page (\d+)\//);
      if (pageMatch) {
        currentPage = parseInt(pageMatch[1]);
      }
    }

    // Handle button actions
    if (interaction.customId.startsWith('leaderboard_prev_')) {
      currentPage = Math.max(1, currentPage - 1);
    } else if (interaction.customId.startsWith('leaderboard_next_')) {
      currentPage = Math.min(totalPages, currentPage + 1);
    }

    const newEmbed = createLeaderboardEmbed(leaderboard, currentPage, totalPages);
    const newButtons = createNavigationButtons(currentPage, totalPages);

    await interaction.editReply({
      embeds: [newEmbed],
      components: totalPages > 1 ? [newButtons] : []
    });

  } catch (error) {
    console.error('Leaderboard button error:', error);
    await interaction.editReply({
      content: '❌ Error updating leaderboard. Please try the command again.',
      embeds: [],
      components: []
    });
  }
}
