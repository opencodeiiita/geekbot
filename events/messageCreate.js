const { Events, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Octokit } = require('@octokit/rest');
const RepoLink = require('../models/repoLink');
const RegistrationContext = require('../models/registrationContext');
const { parseChannelFromArgs, parseRolesFromArgs } = require('../utils/messageUtils');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Handle multiple channels selection for registration
 */
async function handleMultipleChannels(message, args, repoName, repoKey, matchingChannels, roleStartIndex) {
  const channelArg = args[1];
  const total = matchingChannels.length;
  const perPage = 25;
  const currentPage = 0;
  const maxPages = Math.ceil(total / perPage);
  const timestamp = Date.now();

  const pageChannels = matchingChannels.slice(currentPage * perPage, (currentPage + 1) * perPage);
  const options = pageChannels.map(ch => {
    const category = ch.parent ? ` in ${ch.parent.name}` : '';
    return new StringSelectMenuOptionBuilder()
      .setLabel(ch.name)
      .setDescription(`Channel${category}`)
      .setValue(`register_channel_${ch.id}_${timestamp}`);
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`register_channel_select_${message.author.id}_${timestamp}`)
    .setPlaceholder(`Select the "${channelArg}" channel (Page ${currentPage + 1}/${maxPages})`)
    .addOptions(options);

  const components = [new ActionRowBuilder().addComponents(selectMenu)];

  // Add pagination buttons if needed
  if (maxPages > 1) {
    const buttons = [];
    if (currentPage < maxPages - 1) {
      buttons.push(new ButtonBuilder()
        .setCustomId(`register_page_next_${message.author.id}_${timestamp}`)
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary));
    }
    if (buttons.length > 0) {
      components.push(new ActionRowBuilder().addComponents(buttons));
    }
  }

  // Store registration context in DB
  const key = `register_${message.author.id}_${timestamp}`;
  await RegistrationContext.findOneAndUpdate(
    { key },
    {
      key,
      repoName,
      repoKey,
      mentionRoles: args.slice(roleStartIndex),
      matchingChannels,
      currentPage,
      timestamp,
      userId: message.author.id
    },
    { upsert: true, new: true }
  );

  console.log('Stored registration context in DB for key:', key, 'channels:', matchingChannels.length);

  return message.reply({
    content: `Multiple channels found with name "${channelArg}". Please select which one to use:`,
    components
  });
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    if (message.content.startsWith('!register')) {
      console.log('!register command received:', message.content, 'from', message.author.tag, 'in', message.guild?.name);

      const args = message.content.split(' ').slice(1);
      if (args.length < 1) {
        return message.reply('Usage: !register [owner/repo] [#channel] [role1] [role2] ...');
      }

      // Validate repository format
      const rawRepo = args[0];
      if (!rawRepo.includes('/')) {
        return message.reply('Usage: !register [owner/repo] [#channel] [role1] [role2] ...');
      }

      const repoName = rawRepo;
      const repoKey = repoName.toLowerCase();

      // Parse channel using utility function
      const channelResult = parseChannelFromArgs(args, message.guild, 1);

      if (channelResult.error && channelResult.error !== 'MULTIPLE_CHANNELS') {
        return message.reply(channelResult.error);
      }

      let channel = channelResult.channel;
      let roleStartIndex = channelResult.nextIndex;

      // Handle multiple channels case
      if (channelResult.error === 'MULTIPLE_CHANNELS') {
        return await handleMultipleChannels(message, args, repoName, repoKey, channelResult.matchingChannels, roleStartIndex);
      }

      // Default to current channel if no channel specified
      if (!channel) {
        channel = message.channel;
        roleStartIndex = 1;
      }

      // Check permissions
      if (!channel.permissionsFor(message.guild.members.me).has('SendMessages')) {
        return message.reply('I do not have permission to send messages in that channel.');
      }

      // Parse roles using utility function
      let mentionRoles = [];
      try {
        mentionRoles = parseRolesFromArgs(args, message.guild, roleStartIndex);
      } catch (error) {
        return message.reply(error.message);
      }

      // Save to database
      try {
        await RepoLink.findOneAndUpdate(
          { guildId: message.guild.id, repoKey, channelId: channel.id },
          {
            repoName,
            repoKey,
            channelId: channel.id,
            mentionRoles,
            lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          { upsert: true, new: true }
        );

        const roleMentions = mentionRoles.length > 0 ? ` with roles: ${mentionRoles.map(id => `<@&${id}>`).join(', ')}` : '';
        message.reply(`Registered ${repoName} to track updates in ${channel}${roleMentions}.`);
      } catch (error) {
        console.error('Registration error:', error);
        message.reply('Error registering repo.');
      }
    }
  },
};