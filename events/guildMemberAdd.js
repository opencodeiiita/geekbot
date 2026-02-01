const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  execute(member) {
    const rulesChannel = member.guild.channels.cache.find((ch) => ch.name === 'rules📃');
    const rolesChannel = member.guild.channels.cache.find((ch) => ch.name === 'roles🙋');
    const helpChannel = member.guild.channels.cache.find((ch) => ch.name === 'help-channel❓');

    const rulesMention = rulesChannel ? `<#${rulesChannel.id}>` : '#rules📃';
    const rolesMention = rolesChannel ? `<#${rolesChannel.id}>` : '#roles🙋';
    const helpMention = helpChannel ? `<#${helpChannel.id}>` : '#help-channel❓';

    const logoUrl = process.env.WELCOME_LOGO_URL || member.guild.iconURL({ size: 256, extension: 'png' });
    const bannerUrl = process.env.WELCOME_BANNER_URL || member.guild.bannerURL?.({ size: 1024, extension: 'png' });

    const mentorRole = member.guild.roles.cache.find(role => role.name.toLowerCase() === 'mentor');
    const mentorMention = mentorRole ? `<@&${mentorRole.id}>` : '@Mentor';

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

    // Send to configured welcome channel if provided, else #welcome by name, else system channel.
    let channel = null;
    if (process.env.WELCOME_CHANNEL_ID) {
      channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID) || null;
    }
    if (!channel) {
      channel = member.guild.channels.cache.find((ch) => ch.name === 'welcome') || null;
    }
    if (!channel) {
      channel = member.guild.systemChannel || null;
    }

    // Make sure the resolved channel can accept messages.
    const target = channel && typeof channel.isTextBased === 'function' && channel.isTextBased() ? channel : null;
    if (!target) {
      console.log('Welcome channel is missing or not text-based.');
      return;
    }

    // Tag first, then the embed message box.
    target.send({ content: `${member}`, embeds: [embed] });
  },
};