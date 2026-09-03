async function broadcastToChannels(client, links, issueData, randomMsg) {
  if (process.env.ENABLE_ISSUE_MESSAGES !== 'true') {
    console.log('🔇 Message broadcasting is disabled via ENV.');
    return;
  }

  const embed = {
    author: {
      name: issueData.authorName,
      icon_url: issueData.authorAvatar,
      url: issueData.authorUrl,
    },
    title: issueData.title,
    url: issueData.url,
    description: `**${issueData.rawTitle}**\n\n${issueData.description}`,
    color: issueData.color,
    fields: [
      { name: 'Repository', value: `[${issueData.repoName}](${issueData.repoUrl})`, inline: true },
      { name: 'Labels', value: issueData.labelsText, inline: true },
      { name: 'Points', value: String(issueData.points), inline: true },
      { name: 'Type', value: issueData.type, inline: true },
      { name: 'State', value: issueData.state, inline: true },
    ],
    image: {
      url: `https://opengraph.githubassets.com/1/${issueData.repoName}/issues/${issueData.number}`,
    },
    footer: {
      text: issueData.footerText,
    },
    timestamp: issueData.timestamp,
  };
  
  const prefix = issueData.isBounty ? 'Bounty Alert!' : '👋 Hello Contributors!';

  for (const link of links) {
    const guild = client.guilds.cache.get(link.guildId);
    if (!guild) {
      console.warn(`❌ Guild ${link.guildId} missing from cache. Bot kicked or out of sync.`);
      continue;
    }

    const channel = guild.channels.cache.get(link.channelId);
    if (!channel) {
      console.warn(`❌ Channel ${link.channelId} missing in ${guild.name}. Deleted?`);
      continue;
    }

    let roleMentions = '';
    if (link.mentionRoles && link.mentionRoles.length > 0) {
      roleMentions = link.mentionRoles
        .filter(roleId => {
          const role = guild.roles.cache.get(roleId);
          return role && !['Mentor', 'Contributor'].includes(role.name);
        })
        .map(roleId => `<@&${roleId}>`)
        .join(' ');
    }

    const textContent = `${prefix} ${roleMentions}\n\n${randomMsg}`.trim();

    try {
      await channel.send({
        content: textContent,
        embeds: [embed]
      });
      console.log(`📤 Dispatched issue #${issueData.number} to ${guild.name} -> #${channel.name}`);
      
    } catch (error) {
      console.error(`🚨 DISCORD API ERROR in #${channel.name}:`);
      console.error(`   Reason: ${error.message}`);
      
    }
  }
}

module.exports =  broadcastToChannels
