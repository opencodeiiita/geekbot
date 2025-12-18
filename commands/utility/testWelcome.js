const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
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

    const rulesChannel = interaction.guild.channels.cache.find(ch => ch.name === 'rules📃');
    const rolesChannel = interaction.guild.channels.cache.find(ch => ch.name === 'roles🙋');
    const helpChannel = interaction.guild.channels.cache.find(ch => ch.name === 'help-channel❓');

    const welcomeMessage = `
We at GeekHaven welcome you to your journey through open-source in this world curated by enthusiasts like you!

To proceed further, follow these steps:

    Read and abide by the rules mentioned in ${rulesChannel ? `<#${rulesChannel.id}>` : 'rules📃'}
    Register at Unstop, click here to register.
    To get yourself registered on leaderboard login on the Geekhaven Portal.
    Go through the Participants Rulebook for a complete tutorial/guide on how to participate.
    Check out all repos at the OpenCode Github portal.
    Get your role in ${rolesChannel ? `<#${rolesChannel.id}>` : 'roles🙋'} for the topics you are interested in!
    Go forth and conquer the open-source world...
For any additional help
ping @Mentor in ${helpChannel ? `<#${helpChannel.id}>` : 'help-channel❓'} channel

Regards, Team Geekhaven
    `.trim();

    // Placeholder for image URL - replace with actual image link
    const imageUrl = 'https://example.com/placeholder-image.png'; // TODO: Replace with actual image URL

    const embed = new EmbedBuilder()
      .setTitle('Team Geekhaven')
      .setDescription(`Welcome to the OpenCode Server!\nHey ${member}! :wave:\n\n${welcomeMessage}`)
      .setImage(imageUrl)
      .setColor(0x00ff00); // Green color, adjust as needed

    await interaction.reply({ content: 'Testing welcome message:', ephemeral: true });
    await interaction.followUp({ embeds: [embed] });
  },
};