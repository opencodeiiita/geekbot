const { Events, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Octokit } = require('@octokit/rest');
const RepoLink = require('../models/repoLink');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    if (message.content.startsWith('!register')) {
      const args = message.content.split(' ').slice(1);
      if (args.length < 2) {
        return message.reply('Usage: !register [owner/repo] [#channel] [role1] [role2] ...');
      }

      // Accept "owner/repo" format only
      const rawRepo = args[0];
      if (!rawRepo.includes('/')) {
        return message.reply('Usage: !register [owner/repo] [#channel]');
      }
      const repoName = rawRepo;
      const repoKey = repoName.toLowerCase();
      const channelArg = args[1];

      // Parse channel mention or find by name
      let channel;
      const channelMentionMatch = channelArg.match(/^<#(\d+)>$/);
      if (channelMentionMatch) {
        // It's a channel mention, get by ID
        channel = message.guild.channels.cache.get(channelMentionMatch[1]);
      } else {
        // It's a channel name, find by name
        const matchingChannels = message.guild.channels.cache.filter(ch => ch.name === channelArg);
        if (matchingChannels.size === 0) {
          return message.reply(`Channel "${channelArg}" not found.`);
        } else if (matchingChannels.size === 1) {
          channel = matchingChannels.first();
        } else {
          // Multiple channels with same name - show select menu
          const options = matchingChannels.map(ch => {
            const category = ch.parent ? ` in ${ch.parent.name}` : '';
            return new StringSelectMenuOptionBuilder()
              .setLabel(ch.name)
              .setDescription(`Channel${category}`)
              .setValue(`register_channel_${ch.id}_${Date.now()}`); // Include timestamp to make unique
          });

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`register_channel_select_${message.author.id}_${Date.now()}`) // Make unique per user
            .setPlaceholder(`Select the "${channelArg}" channel`)
            .addOptions(options);

          const row = new ActionRowBuilder().addComponents(selectMenu);

          // Store registration context for later use
          const registrationContext = {
            repoName,
            repoKey,
            mentionRoles: args.slice(2), // Store raw role args for later processing
            timestamp: Date.now()
          };

          // Store context (in a simple in-memory store for now - could be improved with a database)
          if (!global.registrationContexts) {
            global.registrationContexts = new Map();
          }
          global.registrationContexts.set(`register_${message.author.id}_${Date.now()}`, registrationContext);

          return message.reply({
            content: `Multiple channels found with name "${channelArg}". Please select which one to use:`,
            components: [row]
          });
        }
      }

      if (!channel) {
        return message.reply(`Channel "${channelArg}" not found.`);
      }

      // Check permissions
      if (!channel.permissionsFor(message.guild.members.me).has('SendMessages')) {
        return message.reply('I do not have permission to send messages in that channel.');
      }

      // Parse roles (optional)
      const mentionRoles = [];
      for (let i = 2; i < args.length; i++) {
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