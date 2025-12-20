const mongoose = require('mongoose');

const repoLinkSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  repoName: { type: String, required: true }, // e.g., 'opencodeiiita/geekbot'
  channelId: { type: String, required: true },
  lastChecked: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RepoLink', repoLinkSchema);