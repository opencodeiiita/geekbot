const { Events, MessageFlags, Collection } = require('discord.js');
const RegistrationContext = require('../models/registrationContext');

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
      if (interaction.customId.startsWith('register_page_')) {
        await handleRegisterPageButton(interaction);
        return;
      }
    }

    // Handle select menu interactions
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('register_channel_select_')) {
        await handleRegisterChannelSelect(interaction);
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
        content: '❌ Leaderboard data is currently unavailable. The website uses JavaScript rendering that cannot be scraped.',
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
};

// Handle register channel selection
async function handleRegisterChannelSelect(interaction) {
  const { Octokit } = require('@octokit/rest');
  const RepoLink = require('../models/repoLink');

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const selectedValue = interaction.values[0];

  // Extract channel ID from the selected value
  const channelIdMatch = selectedValue.match(/register_channel_(\d+)_/);
  if (!channelIdMatch) {
    return await interaction.reply({
      content: '❌ Invalid selection.',
      ephemeral: true
    });
  }

  const channelId = channelIdMatch[1];
  const channel = interaction.guild.channels.cache.get(channelId);

  if (!channel) {
    return await interaction.reply({
      content: '❌ Selected channel not found.',
      ephemeral: true
    });
  }

  // Extract context key from customId
  const contextKeyMatch = interaction.customId.match(/register_channel_select_(\d+)_(\d+)/);
  if (!contextKeyMatch) {
    return await interaction.reply({
      content: '❌ Registration context expired. Please try the !register command again.',
      ephemeral: true
    });
  }

  const userId = contextKeyMatch[1];
  const timestamp = contextKeyMatch[2];
  const contextKey = `register_${userId}_${timestamp}`;

  // Get stored context from DB
  const contextDoc = await RegistrationContext.findOne({ key: contextKey });
  if (!contextDoc) {
    console.log('Context not found in DB for key:', contextKey);
    return await interaction.reply({
      content: '❌ Registration context expired. Please try the !register command again.',
      ephemeral: true
    });
  }

  // Check if context is expired (5 minutes)
  if (Date.now() - contextDoc.timestamp > 5 * 60 * 1000) {
    console.log('Context expired for key:', contextKey, 'age:', Date.now() - contextDoc.timestamp);
    await RegistrationContext.deleteOne({ key: contextKey });
    return await interaction.reply({
      content: '❌ Registration context expired. Please try the !register command again.',
      ephemeral: true
    });
  }

  console.log('Retrieved context from DB for key:', contextKey);

  const context = contextDoc.toObject();

  await RegistrationContext.deleteOne({ key: contextKey }); // Clean up

  // Check permissions
  if (!channel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
    return await interaction.reply({
      content: '❌ I do not have permission to send messages in that channel.',
      ephemeral: true
    });
  }

  // Parse roles from stored context
  const mentionRoles = [];
  for (const roleArg of context.mentionRoles) {
    const match = roleArg.match(/^<@&(\d+)>$/);
    if (match) {
      mentionRoles.push(match[1]);
    } else {
      const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleArg.toLowerCase());
      if (role) {
        mentionRoles.push(role.id);
      } else {
        return await interaction.reply({
          content: `❌ Role "${roleArg}" not found.`,
          ephemeral: true
        });
      }
    }
  }

  // Save to database
  try {
    await RepoLink.findOneAndUpdate(
      { guildId: interaction.guild.id, repoKey: context.repoKey, channelId: channel.id },
      {
        repoName: context.repoName,
        repoKey: context.repoKey,
        channelId: channel.id,
        mentionRoles,
        lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    const roleMentions = mentionRoles.length > 0 ? ` with roles: ${mentionRoles.map(id => `<@&${id}>`).join(', ')}` : '';

    await interaction.update({
      content: `✅ Registered ${context.repoName} to track updates in ${channel}${roleMentions}.`,
      components: []
    });
  } catch (error) {
    console.error('Registration error:', error);
    await interaction.reply({
      content: '❌ Error registering repo.',
      ephemeral: true
    });
  }
}

async function handleRegisterPageButton(interaction) {
  const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const customId = interaction.customId;
  const isPrev = customId.includes('_prev_');
  const isNext = customId.includes('_next_');

  // Extract userId and timestamp
  const match = customId.match(/register_page_(prev|next)_(\d+)_(\d+)/);
  if (!match) {
    return await interaction.reply({
      content: '❌ Invalid button.',
      ephemeral: true
    });
  }

  const direction = match[1];
  const userId = match[2];
  const timestamp = match[3];
  const contextKey = `register_${userId}_${timestamp}`;

  // Get stored context from DB
  const contextDoc = await RegistrationContext.findOne({ key: contextKey });
  if (!contextDoc) {
    console.log('Page button: Context not found in DB for key:', contextKey);
    return await interaction.reply({
      content: '❌ Registration context expired. Please try the !register command again.',
      ephemeral: true
    });
  }

  // Check if context is expired (5 minutes)
  if (Date.now() - contextDoc.timestamp > 5 * 60 * 1000) {
    console.log('Page button: Context expired for key:', contextKey, 'age:', Date.now() - contextDoc.timestamp);
    await RegistrationContext.deleteOne({ key: contextKey });
    return await interaction.reply({
      content: '❌ Registration context expired. Please try the !register command again.',
      ephemeral: true
    });
  }

  console.log('Page button: Retrieved context from DB for key:', contextKey);

  const context = contextDoc.toObject();

  // Update page
  const perPage = 25;
  const total = context.matchingChannels.length;
  const maxPages = Math.ceil(total / perPage);
  let newPage = context.currentPage;

  if (direction === 'prev' && newPage > 0) {
    newPage--;
  } else if (direction === 'next' && newPage < maxPages - 1) {
    newPage++;
  }

  // Update context
  context.currentPage = newPage;

  // Save updated context to DB
  await RegistrationContext.findOneAndUpdate(
    { key: contextKey },
    { currentPage: newPage },
    { new: true }
  );

  // Rebuild options
  const pageChannels = context.matchingChannels.slice(newPage * perPage, (newPage + 1) * perPage);
  const options = pageChannels.map(ch => {
    const category = ch.parent ? ` in ${ch.parent.name}` : '';
    return new StringSelectMenuOptionBuilder()
      .setLabel(ch.name)
      .setDescription(`Channel${category}`)
      .setValue(`register_channel_${ch.id}_${Date.now()}`); // New timestamp to make unique
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`register_channel_select_${userId}_${timestamp}`) // Same timestamp
    .setPlaceholder(`Select the channel (Page ${newPage + 1}/${maxPages})`)
    .addOptions(options);

  const components = [new ActionRowBuilder().addComponents(selectMenu)];

  // Add pagination buttons
  const buttons = [];
  if (newPage > 0) {
    buttons.push(new ButtonBuilder()
      .setCustomId(`register_page_prev_${userId}_${timestamp}`)
      .setLabel('Previous')
      .setStyle(ButtonStyle.Secondary));
  }
  if (newPage < maxPages - 1) {
    buttons.push(new ButtonBuilder()
      .setCustomId(`register_page_next_${userId}_${timestamp}`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary));
  }
  if (buttons.length > 0) {
    components.push(new ActionRowBuilder().addComponents(buttons));
  }

  // Update the message
  await interaction.update({
    content: `Multiple channels found. Please select which one to use:`,
    components
  });
}
