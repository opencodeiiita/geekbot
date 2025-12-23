const express = require('express');
const { verifyGithubSignature } = require('./githubUtils');
const { handleIssueOpened, handlePullRequestOpened } = require('./webhookHandlers');

/**
 * Creates and configures Express app for webhooks
 * @param {Object} client - Discord client instance
 * @returns {Object} - Express app instance
 */
function createWebhookServer(client) {
  const app = express();

  // Capture the raw request body for GitHub signature verification
  app.use(express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }));

  // Webhook handler
  async function webhookHandler(req, res) {
    const payload = req.body || {};
    const event = req.headers['x-github-event'];

    // Verify signature
    const signatureResult = verifyGithubSignature(req);
    if (!signatureResult.ok) {
      return res.status(signatureResult.status).send(signatureResult.msg);
    }

    try {
      // Route to appropriate handler
      switch (event) {
        case 'issues':
          if (payload.action === 'opened') {
            await handleIssueOpened(payload, client);
          }
          break;

        case 'pull_request':
          if (payload.action === 'opened') {
            await handlePullRequestOpened(payload, client);
          }
          break;
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).send('Internal server error');
    }
  }

  // Webhook endpoints
  app.post('/api/v1/discord-bot', webhookHandler);
  app.post('/back/api/v1/discord-bot', webhookHandler);

  return app;
}

/**
 * Starts the webhook server
 * @param {Object} app - Express app instance
 * @param {number} port - Port to listen on
 */
function startWebhookServer(app, port = 3001) {
  app.listen(port, () => {
    console.log(`Webhook server listening on port ${port}`);
  });
}

module.exports = {
  createWebhookServer,
  startWebhookServer,
};