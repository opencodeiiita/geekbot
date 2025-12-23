/**
 * Parse channel from message arguments
 * @param {Array<string>} args - Message arguments
 * @param {Object} guild - Discord guild
 * @param {number} startIndex - Index to start parsing from
 * @returns {Object} - { channel, nextIndex, error }
 */
function parseChannelFromArgs(args, guild, startIndex = 1) {
  if (args.length <= startIndex) {
    return { channel: null, nextIndex: startIndex, error: null };
  }

  const channelArg = args[startIndex];

  // Try to parse as channel mention <#id>
  const channelMentionMatch = channelArg.match(/^<#(\d+)>$/);
  if (channelMentionMatch) {
    const channel = guild.channels.cache.get(channelMentionMatch[1]);
    return {
      channel,
      nextIndex: startIndex + 1,
      error: channel ? null : 'Mentioned channel not found.',
    };
  }

  // Try to find channel by name
  const matchingChannels = guild.channels.cache.filter(ch => ch.name === channelArg);

  if (matchingChannels.size === 0) {
    return { channel: null, nextIndex: startIndex, error: `Channel "${channelArg}" not found.` };
  }

  if (matchingChannels.size === 1) {
    return { channel: matchingChannels.first(), nextIndex: startIndex + 1, error: null };
  }

  // Multiple channels found - return special case
  return {
    channel: null,
    nextIndex: startIndex + 1,
    error: 'MULTIPLE_CHANNELS',
    matchingChannels: Array.from(matchingChannels.values()),
  };
}

/**
 * Parse roles from message arguments
 * @param {Array<string>} args - Message arguments
 * @param {Object} guild - Discord guild
 * @param {number} startIndex - Index to start parsing from
 * @returns {Array} - Array of role IDs
 */
function parseRolesFromArgs(args, guild, startIndex) {
  const mentionRoles = [];

  for (let i = startIndex; i < args.length; i++) {
    const roleArg = args[i];

    // If it's a mention <@&id>, extract id
    const mentionMatch = roleArg.match(/^<@&(\d+)>$/);
    if (mentionMatch) {
      mentionRoles.push(mentionMatch[1]);
      continue;
    }

    // Try to find role by name
    const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleArg.toLowerCase());
    if (role) {
      mentionRoles.push(role.id);
    } else {
      throw new Error(`Role "${roleArg}" not found.`);
    }
  }

  return mentionRoles;
}

module.exports = {
  parseChannelFromArgs,
  parseRolesFromArgs,
};