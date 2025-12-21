const mongoose = require('mongoose');

const repoLinkSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  // Canonical key used for matching webhook payloads.
  // Always store as lowercase "owner/repo".
  repoKey: { type: String, index: true },
  // Original repo name as provided/used elsewhere (kept for backward-compat).
  repoName: { type: String, required: true }, // e.g., 'opencodeiiita/geekbot'
  channelId: { type: String, required: true },
  mentionRoles: [{ type: String }], // Array of role IDs or names to mention
  lastChecked: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RepoLink', repoLinkSchema);