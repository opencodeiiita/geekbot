const { Events } = require('discord.js');
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
        return message.reply('Usage: !register [owner/repo] [channel-name] [role1] [role2] ...');
      }

      // Accept "owner/repo" format only
      const rawRepo = args[0];
      if (!rawRepo.includes('/')) {
        return message.reply('Usage: !register [owner/repo] [channel-name]');
      }
      const repoName = rawRepo;
      const repoKey = repoName.toLowerCase();
      const channelName = args[1];

      // Find the channel
      const channel = message.guild.channels.cache.find(ch => ch.name === channelName);
      if (!channel) {
        return message.reply(`Channel "${channelName}" not found.`);
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