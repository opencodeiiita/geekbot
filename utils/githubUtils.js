const crypto = require('crypto');

/**
 * Verifies GitHub webhook signature
 * @param {Object} req - Express request object
 * @returns {Object} - { ok: boolean, status: number, msg: string }
 */
function verifyGithubSignature(req) {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    return { ok: false, status: 401, msg: 'Unauthorized' };
  }

  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { ok: false, status: 500, msg: 'Server misconfigured' };
  }

  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.rawBody || Buffer.from(''))
    .digest('hex');

  const expected = Buffer.from(`sha256=${computedSignature}`, 'ascii');
  const actual = Buffer.from(String(signature), 'ascii');

  if (expected.length !== actual.length) {
    return { ok: false, status: 401, msg: 'Unauthorized' };
  }

  if (!crypto.timingSafeEqual(expected, actual)) {
    return { ok: false, status: 401, msg: 'Unauthorized' };
  }

  return { ok: true };
}

/**
 * Extracts points value from labels
 * @param {Array<string>} labels - Array of label names
 * @returns {Object} - { points: string, pointsValue: number }
 */
function extractPointsFromLabels(labels) {
  let points = 'Not specified';
  let pointsValue = 0;

  for (const label of labels) {
    const match = label.match(/points:\s*(\d+)/i);
    if (match) {
      points = match[1];
      pointsValue = parseInt(match[1], 10);
      break;
    }
  }

  return { points, pointsValue };
}

/**
 * Determines issue type based on labels
 * @param {Array<string>} labels - Array of label names
 * @returns {string} - Issue type
 */
function determineIssueType(labels) {
  const { ISSUE_TYPES } = require('./constants');

  if (labels.some(l => l.toLowerCase().includes('ofa') || l.toLowerCase().includes('open-for-all'))) {
    return ISSUE_TYPES.OPEN_FOR_ALL;
  }

  if (labels.some(l => l.toLowerCase().includes('compe') || l.toLowerCase().includes('competitive'))) {
    return ISSUE_TYPES.COMPETITIVE;
  }

  return ISSUE_TYPES.FCFS;
}

/**
 * Gets embed color based on points value
 * @param {number} pointsValue - Points value
 * @returns {number} - Color hex value
 */
function getEmbedColor(pointsValue) {
  const { EMBED_COLORS, POINTS_THRESHOLDS } = require('./constants');

  if (pointsValue >= POINTS_THRESHOLDS.VERY_HIGH) {
    return EMBED_COLORS.VERY_HIGH_POINTS;
  }

  if (pointsValue >= POINTS_THRESHOLDS.HIGH) {
    return EMBED_COLORS.HIGH_POINTS;
  }

  if (pointsValue >= POINTS_THRESHOLDS.MEDIUM) {
    return EMBED_COLORS.MEDIUM_POINTS;
  }

  return EMBED_COLORS.DEFAULT;
}

/**
 * Truncates description to maximum 5 lines
 * @param {string} body - Issue/PR body
 * @returns {string} - Truncated description
 */
function truncateDescription(body) {
  if (!body) return 'No description provided.';

  const lines = body.split('\n');
  if (lines.length > 5) {
    return lines.slice(0, 5).join('\n') + '\n...';
  }

  return body;
}

module.exports = {
  verifyGithubSignature,
  extractPointsFromLabels,
  determineIssueType,
  getEmbedColor,
  truncateDescription,
};