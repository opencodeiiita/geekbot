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
      if (args.length !== 2) {
        return message.reply('Usage: !register [repo-name] [channel-name]');
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

      // Save to database
      try {
        await RepoLink.findOneAndUpdate(
          { guildId: message.guild.id, repoKey, channelId: channel.id },
          { repoName, repoKey, channelId: channel.id, lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          { upsert: true, new: true }
        );

        message.reply(`Registered ${repoName} to track updates in ${channel}.`);
      } catch (error) {
        console.error(error);
        message.reply('Error registering repo.');
      }
    }
  },
};