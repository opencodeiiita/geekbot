require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', async () => {
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.log('No guild found');
    process.exit(1);
  }

  console.log('Fetching all members...');
  await guild.members.fetch();
  console.log('Fetched members.');

  const role = guild.roles.cache.find(r => r.name === 'Mentor');
  if (!role) {
    console.log('Mentor role not found');
    process.exit(1);
  }

  const usernames = [
    "notcalc",
    "percival1210",
    "Pratikrkcha",
    "bluesisekai",
    "abdul230898",
    "Washikiballa-San",
    "uk_ssm_69622",
    "Vaidik19",
    "pixel",
    "cute_flame",
    "adith0542",
    "mayanka9376",
    "sankalpj_47",
    "fire_5419",
    "VirtualVard",
    "hyperghost4951",
    "angrycraxxx",
    "dvpalticas467",
    "spacesheep_.",
    "ryanduno4146",
    "hum_sqx26",
    "HGRgamer",
    "vichanshuraj",
    "neopearl6",
    "yashaggarwal_04641",
    "levitating2",
    "Zonedout_dg",
    "the.rational_idiot",
    "baarishaaa",
    "pookie_omen",
    "calcifer_67",
    "Vinesh007",
    "anubhavsharma0116_20644",
    "Krish.",
    "kyan_mahajan",
    "willywonka200005",
    "Olaff3418",
    "pookie_omen"
  ];

  for (const username of usernames) {
    try {
      const member = guild.members.cache.find(m => m.user.username.toLowerCase() === username.toLowerCase() || m.displayName.toLowerCase() === username.toLowerCase());
      if (member) {
        await member.roles.add(role);
        console.log(`Added Mentor role to ${member.user.tag}`);
      } else {
        console.log(`Member ${username} not found`);
      }
    } catch (error) {
      console.log(`Error adding role to ${username}: ${error.message}`);
    }
  }

  console.log('Done');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);