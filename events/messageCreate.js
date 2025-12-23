const { Events, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Octokit } = require('@octokit/rest');
const RepoLink = require('../models/repoLink');
const RegistrationContext = require('../models/registrationContext');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

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

      // Accept "owner/repo" format only
      const rawRepo = args[0];
      if (!rawRepo.includes('/')) {
        return message.reply('Usage: !register [owner/repo] [#channel] [role1] [role2] ...');
      }
      const repoName = rawRepo;
      const repoKey = repoName.toLowerCase();

      let channel = message.channel;
      let roleStartIndex = 1;
      if (args.length >= 2) {
        const channelArg = args[1];
        // Try to parse as channel
        let parsedChannel;
        const channelMentionMatch = channelArg.match(/^<#(\d+)>$/);
        if (channelMentionMatch) {
          parsedChannel = message.guild.channels.cache.get(channelMentionMatch[1]);
        } else {
          const matchingChannels = message.guild.channels.cache.filter(ch => ch.name === channelArg);
          if (matchingChannels.size === 1) {
            parsedChannel = matchingChannels.first();
          } else if (matchingChannels.size > 1) {
            // Multiple channels - show paginated select menu
            const total = matchingChannels.size;
            const perPage = 25;
            const currentPage = 0;
            const maxPages = Math.ceil(total / perPage);
            const timestamp = Date.now();

            const pageChannels = Array.from(matchingChannels.values()).slice(currentPage * perPage, (currentPage + 1) * perPage);
            const options = pageChannels.map(ch => {
              const category = ch.parent ? ` in ${ch.parent.name}` : '';
              return new StringSelectMenuOptionBuilder()
                .setLabel(ch.name)
                .setDescription(`Channel${category}`)
                .setValue(`register_channel_${ch.id}_${timestamp}`); // Use timestamp
            });

            const selectMenu = new StringSelectMenuBuilder()
              .setCustomId(`register_channel_select_${message.author.id}_${timestamp}`) // Use timestamp
              .setPlaceholder(`Select the "${channelArg}" channel (Page ${currentPage + 1}/${maxPages})`)
              .addOptions(options);

            const components = [new ActionRowBuilder().addComponents(selectMenu)];

            // Add pagination buttons if needed
            if (maxPages > 1) {
              const buttons = [];
              if (currentPage > 0) {
                buttons.push(new ButtonBuilder()
                  .setCustomId(`register_page_prev_${message.author.id}_${timestamp}`)
                  .setLabel('Previous')
                  .setStyle(ButtonStyle.Secondary));
              }
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
                mentionRoles: args.slice(2),
                matchingChannels: Array.from(matchingChannels.values()),
                currentPage,
                timestamp,
                userId: message.author.id
              },
              { upsert: true, new: true }
            );

            console.log('Stored registration context in DB for key:', key, 'channels:', matchingChannels.size);

            return message.reply({
              content: `Multiple channels found with name "${channelArg}". Please select which one to use:`,
              components
            });
          }
        }
        if (parsedChannel) {
          channel = parsedChannel;
          roleStartIndex = 2;
        }
        // If not parsed, keep default channel and roleStartIndex=1
      }

      // Check permissions
      if (!channel.permissionsFor(message.guild.members.me).has('SendMessages')) {
        return message.reply('I do not have permission to send messages in that channel.');
      }

      // Parse roles (optional)
      const mentionRoles = [];
      for (let i = roleStartIndex; i < args.length; i++) {
        const roleArg = args[i];
        // If it's a mention <@&id>, extract id
        const match = roleArg.match(/^<@&(\d+)>$/);
        if (match) {
          mentionRoles.push(match[1]);
        } else {
          // Try to find role by name
          const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleArg.toLowerCase());
          if (role) {
            mentionRoles.push(role.id);
          } else {
            return message.reply(`Role "${roleArg}" not found.`);
          }
        }
      }

      // Save to database
      try {
        await RepoLink.findOneAndUpdate(
          { guildId: message.guild.id, repoKey, channelId: channel.id },
          { repoName, repoKey, channelId: channel.id, mentionRoles, lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          { upsert: true, new: true }
        );

        const roleMentions = mentionRoles.length > 0 ? ` with roles: ${mentionRoles.map(id => `<@&${id}>`).join(', ')}` : '';
        message.reply(`Registered ${repoName} to track updates in ${channel}${roleMentions}.`);
      } catch (error) {
        console.error(error);
        message.reply('Error registering repo.');
      }
    }
  },
};