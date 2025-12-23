const { Events, EmbedBuilder } = require('discord.js');
const { CHANNEL_NAMES, ROLE_NAMES } = require('../utils/constants');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  execute(member) {
    // Create channel and role lookup maps for O(1) access
    const channels = new Map(member.guild.channels.cache.map(ch => [ch.name, ch]));
    const roles = new Map(member.guild.roles.cache.map(role => [role.name.toLowerCase(), role]));

    // Find channels using Map lookup (O(1) instead of O(n))
    const rulesChannel = channels.get(CHANNEL_NAMES.RULES);
    const rolesChannel = channels.get(CHANNEL_NAMES.ROLES);
    const helpChannel = channels.get(CHANNEL_NAMES.HELP);

    // Create mentions with fallbacks
    const rulesMention = rulesChannel ? `<#${rulesChannel.id}>` : `#${CHANNEL_NAMES.RULES}`;
    const rolesMention = rolesChannel ? `<#${rolesChannel.id}>` : `#${CHANNEL_NAMES.ROLES}`;
    const helpMention = helpChannel ? `<#${helpChannel.id}>` : `#${CHANNEL_NAMES.HELP}`;

    // Get URLs
    const logoUrl = process.env.WELCOME_LOGO_URL || member.guild.iconURL({ size: 256, extension: 'png' });
    const bannerUrl = process.env.WELCOME_BANNER_URL || member.guild.bannerURL?.({ size: 1024, extension: 'png' });

    // Find mentor role using Map lookup (O(1) instead of O(n))
    const mentorRole = roles.get(ROLE_NAMES.MENTOR);
    const mentorMention = mentorRole ? `<@&${mentorRole.id}>` : `@${ROLE_NAMES.MENTOR}`;

    const description = [
      '**Welcome to the OpenCode Server!**',
      `Hey ${member}!`,
      '',
      'We at GeekHaven welcome you to your journey through open-source in this world curated by enthusiasts like you!',
      '',
      'To proceed further, follow these steps:',
      '',
      `1. Read and abide by the rules mentioned in ${rulesMention}`,
      '2. Register at [Unstop](https://bit.ly/RegisterAtOpencode25)',
      '3. To get yourself registered on leaderboard login on the [GeekHaven Portal](https://events.geekhaven.in)',
      '4. Go through the Participants Rulebook for a complete tutorial/guide on how to participate',
      '5. Check out all repos at the [OpenCode GitHub portal](https://github.com/opencodeiiita)',
      `6. Get your roles in ${rolesMention} for the topics you are interested in!`,
      '7. Go forth and conquer the open-source world...',
      '',
      `For any additional help ping ${mentorMention} in ${helpMention} channel`,
      '',
      'Regards, Team Geekhaven',
    ].join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Team Geekhaven')
      .setDescription(description)
      .setColor(0x00ff00);

    if (logoUrl) embed.setThumbnail(logoUrl);
    if (bannerUrl) embed.setImage(bannerUrl);

    // Find welcome channel with optimized lookup
    let channel = null;

    // 1. Try configured channel ID first
    if (process.env.WELCOME_CHANNEL_ID) {
      channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID) || null;
    }

    // 2. Try named welcome channel using Map lookup
    if (!channel) {
      channel = channels.get(CHANNEL_NAMES.WELCOME) || null;
    }

    // 3. Fallback to system channel
    if (!channel) {
      channel = member.guild.systemChannel || null;
    }

    // Validate channel can accept messages
    const target = channel && typeof channel.isTextBased === 'function' && channel.isTextBased() ? channel : null;
    if (!target) {
      console.log('Welcome channel is missing or not text-based.');
      return;
    }

    // Send welcome message
    target.send({ content: `${member}`, embeds: [embed] });
  },
};