require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  const channelId = '885153522394480680'; // Announcement channel ID

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error('Channel not found.');
    process.exit(1);
  }

  const message = `@everyone

**Community Warning: Botting Prohibited**

Dear Community Members,

Botting activities are **strictly prohibited** in this event, as they violate our community rules and fair-use policy.

We have detected botting activity from:

- User: @siddhantshekhar_71995 (Siddhant Shekhar)
- GitHub: @sshekhar563
- Discord ID: siddhantshekhar_71995

As a consequence, **325 points** have been deducted from their account and they will face ban from event for next 3 days as per the event rules.

Further botting will result in **disqualification from the event**.
Please respect our rules to ensure a fair and enjoyable experience for all members.

— Team OpenCode`;

  await channel.send(message);
  console.log('Announcement sent!');
  client.destroy();
});

client.login(process.env.DISCORD_TOKEN);