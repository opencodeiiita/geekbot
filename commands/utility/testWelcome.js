const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  adminOnly: true,
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('test_welcome')
    .setDescription('Test the welcome message for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to welcome')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return await interaction.reply('User not found in this server.');
    }

    const rulesChannel = interaction.guild.channels.cache.find((ch) => ch.name === 'rules📃');
    const rolesChannel = interaction.guild.channels.cache.find((ch) => ch.name === 'roles🙋');
    const helpChannel = interaction.guild.channels.cache.find((ch) => ch.name === 'help-channel❓');

    const rulesMention = rulesChannel ? `<#${rulesChannel.id}>` : '#rules📃';
    const rolesMention = rolesChannel ? `<#${rolesChannel.id}>` : '#roles🙋';
    const helpMention = helpChannel ? `<#${helpChannel.id}>` : '#help-channel❓';

    const logoUrl = process.env.WELCOME_LOGO_URL || interaction.guild.iconURL({ size: 256, extension: 'png' });
    const bannerUrl = process.env.WELCOME_BANNER_URL || interaction.guild.bannerURL?.({ size: 1024, extension: 'png' });

    const mentorRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'mentor');
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

    await interaction.reply({ content: 'Testing welcome message:', ephemeral: true });
    await interaction.followUp({ content: `${member}`, embeds: [embed] });
  },
};