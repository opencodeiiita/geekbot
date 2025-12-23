/**
 * Check if user is on cooldown for a command
 * @param {Object} interaction - Discord interaction
 * @param {Object} command - Command object with cooldown property
 * @returns {Object|null} - Cooldown info if on cooldown, null otherwise
 */
function checkCooldown(interaction, command) {
  const { cooldowns } = interaction.client;

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 10;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      return {
        expiredTimestamp,
        commandName: command.data.name,
      };
    }
  }

  // Set cooldown
  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  return null;
}

/**
 * Check if user has admin permissions
 * @param {Object} interaction - Discord interaction
 * @returns {boolean} - Whether user has admin permissions
 */
function hasAdminPermissions(interaction) {
  if (!interaction.inGuild()) return false;

  const member = interaction.member;
  return member?.roles?.cache?.some((role) => ADMIN_ROLE_NAMES.has(role.name.toLowerCase())) ?? false;
}

/**
 * Validate registration context from database
 * @param {string} contextKey - Context key
 * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
 * @returns {Object|null} - Context data or null if invalid/expired
 */
async function validateRegistrationContext(contextKey, maxAge = 5 * 60 * 1000) {
  const contextDoc = await RegistrationContext.findOne({ key: contextKey });
  if (!contextDoc) {
    console.log('Context not found in DB for key:', contextKey);
    return null;
  }

  // Check if context is expired
  if (Date.now() - contextDoc.timestamp > maxAge) {
    console.log('Context expired for key:', contextKey, 'age:', Date.now() - contextDoc.timestamp);
    await RegistrationContext.deleteOne({ key: contextKey });
    return null;
  }

  console.log('Retrieved context from DB for key:', contextKey);
  return contextDoc.toObject();
}

module.exports = {
  checkCooldown,
  hasAdminPermissions,
  validateRegistrationContext,
};