
//GITHUB WEBHOOK HANDLER

const broadcastToChannels = require('../utils/broadcastToChannel');
const parseIssuePayload = require('../utils/parseIssuePayload');
const { getIssueMessages, getBountyMessages } = require('../utils/issueMessages');
const RepoLink = require('../models/repoLink');
const crypto = require('crypto');
const { WEBHOOK_SECRET } = process.env;


function verifyGithubSignature(req) {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    return { ok: false, status: 401, msg: 'Unauthorized' };
  }
  if (!WEBHOOK_SECRET) {
    return { ok: false, status: 500, msg: 'Server misconfigured' };
  }

  const computedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
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

const webhookHandler=(client)=>
  {
  return async (req, res)=> {
  console.log('🔗 Webhook received!');
  const payload = req.body || {};
  const event = req.headers['x-github-event'];

  console.log(`Event: ${event}, Action: ${payload.action}, Repo: ${payload.repository?.full_name}`);

  const signatureResult = verifyGithubSignature(req);
  if (!signatureResult.ok) {
    if (signatureResult.status === 401) {
      console.log('❌ Invalid or missing webhook signature');
    } else {
      console.log('❌ Webhook server misconfigured (missing WEBHOOK_SECRET)');
    }
    return res.status(signatureResult.status).send(signatureResult.msg);
  }

  // Use the router function logic adapted for Discord bot
  if (event!=='issues') return res.status(200).json();;
     const action = payload.action
     try{
      if(action==='opened'){
        const issueData=parseIssuePayload(payload,false)
        const links=await RepoLink.find({repoKey: issueData.repoKey})
        //const links=[{guildId: '1014056351506366634', channelId: '1014056351506366637', mentionRoles: ['creator']}]; 

        if(!links.length){
          console.log(`No Db link for repo:${issueData.repoName}`)
          return
        }

        const availableMessages = getIssueMessages(issueData.labels, issueData.pointsValue);
        const randomMsg = availableMessages[Math.floor(Math.random() * availableMessages.length)];
        await broadcastToChannels(client, links, issueData, randomMsg);
      }

      if(action==='labeled'){
        const label = payload.label?.name ? String(payload.label.name).toLowerCase() : '';
        if (label !== 'bounty') return;

        const issueData=parseIssuePayload(payload,true)
        const links=await RepoLink.find({repoKey: issueData.repoKey});
        //const links=[{guildId: '1014056351506366634', channelId: '1014056351506366637', mentionRoles: ['creator']}]; 
        if(!links.length){
          console.log(`No Db link for repo:${issueData.repoName}`)
          return
        }

        const availableMessages = getBountyMessages(issueData.labels, issueData.pointsValue);
        const randomMsg = availableMessages[Math.floor(Math.random() * availableMessages.length)];
        await broadcastToChannels(client, links, issueData, randomMsg);
      }
     }catch(err){
      console.log("error in webhookHandler",err)
     }

      return res.status(200).json();
  }
}

 
module.exports = webhookHandler;