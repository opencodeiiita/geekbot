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

      const repoName = `OPENCODE2025/${args[0]}`;
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
          { guildId: message.guild.id, repoName },
          { channelId: channel.id, lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 1 day ago to catch recent issues
          { upsert: true, new: true }
        );

        // Create webhook
        const [owner, repo] = repoName.split('/');
        await octokit.repos.createWebhook({
          owner,
          repo,
          config: {
            url: 'https://events.geekhaven.in/back/api/v1/github-bot',
            secret: process.env.GITHUB_WEBHOOK_SECRET,
            content_type: 'json'
          },
          events: ['issues', 'pull_request'],
          active: true
        });

        message.reply(`Registered ${repoName} to track updates in ${channel}. Webhook created.`);
      } catch (error) {
        console.error(error);
        message.reply('Error registering repo or creating webhook.');
      }
    }
  },
};