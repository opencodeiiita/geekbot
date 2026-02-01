require('dotenv').config();
const mongoose = require('mongoose');
const { Octokit } = require('@octokit/rest');
const RepoLink = require('./models/repoLink');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function checkRepos() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Fetch all RepoLinks
  const links = await RepoLink.find({});
  console.log(`Found ${links.length} repo links`);

  const results = { valid: [], invalid: [] };

  for (const link of links) {
    const repoName = link.repoName;
    const [owner, repo] = repoName.split('/');
    if (!owner || !repo) {
      results.invalid.push({ repo: repoName, reason: 'Invalid format' });
      continue;
    }
    try {
      await octokit.repos.get({ owner, repo });
      results.valid.push(repoName);
    } catch (error) {
      if (error.status === 404) {
        results.invalid.push({ repo: repoName, reason: '404 Not Found' });
      } else {
        results.invalid.push({ repo: repoName, reason: error.message });
      }
    }
  }

  console.log('Valid repos:');
  results.valid.forEach(r => console.log(`- ${r}`));

  console.log('\nInvalid repos:');
  results.invalid.forEach(r => console.log(`- ${r.repo}: ${r.reason}`));

  // Close connection
  await mongoose.disconnect();
}

checkRepos().catch(console.error);