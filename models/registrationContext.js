const mongoose = require('mongoose');

const registrationContextSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  repoName: { type: String, required: true },
  repoKey: { type: String, required: true },
  mentionRoles: [{ type: String }],
  matchingChannels: [{ type: Object }], // Store channel objects
  currentPage: { type: Number, default: 0 },
  timestamp: { type: Number, required: true },
  userId: { type: String, required: true }
}, { timestamps: true });

// Auto-delete after 5 minutes
registrationContextSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('RegistrationContext', registrationContextSchema);