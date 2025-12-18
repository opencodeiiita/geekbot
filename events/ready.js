const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    console.log(`Guilds: ${client.guilds.cache.map(g => `${g.name} (${g.id})`).join(', ')}`);
  },
};
