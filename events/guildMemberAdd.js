const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  execute(member) {
    const rulesChannel = member.guild.channels.cache.find(ch => ch.name === 'rules📃');
    const rolesChannel = member.guild.channels.cache.find(ch => ch.name === 'roles🙋');
    const helpChannel = member.guild.channels.cache.find(ch => ch.name === 'help-channel❓');

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
    const imageUrl = 'https://images-ext-1.discordapp.net/external/P26MaGbpZMT4ujrWlWun068PvQiS6HzO7WbKc5KrhTk/https/cdn-longterm.mee6.xyz/plugins/welcome/images/885149696249708635/7a3f6e7d625438b7c30e53e11e30fcdc50786cc21b2ee39db8490afed8090960.jpeg?format=webp&width=1751&height=769'; 

    const embed = new EmbedBuilder()
      .setTitle('Team Geekhaven')
      .setDescription(`Welcome to the OpenCode Server!\nHey ${member}! :wave:\n\n${welcomeMessage}`)
      .setImage(imageUrl)
      .setColor(0x00ff00); // Green color, adjust as needed

    // Send to the welcome channel if it exists, otherwise the system's default channel
    let channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    if (!channel) {
      channel = member.guild.systemChannel;
    }
    if (channel) {
      channel.send({ embeds: [embed] });
    }
  },
};