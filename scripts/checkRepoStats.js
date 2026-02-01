require('dotenv').config();
const mongoose = require('mongoose');
const { Octokit } = require('@octokit/rest');
const RepoLink = require('./models/repoLink');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getRepoWiseStats() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Fetch all RepoLinks
  const repoLinks = await RepoLink.find({});
  console.log(`Found ${repoLinks.length} repositories`);

  const repoStats = [];

  for (const repoLink of repoLinks) {
    const [owner, repo] = repoLink.repoName.split('/');
    if (!owner || !repo) {
      console.log(`Skipping invalid repo: ${repoLink.repoName}`);
      continue;
    }

    try {
      console.log(`Fetching stats for ${repoLink.repoName}...`);

      // Get merged PRs for this repository
      const prs = await octokit.paginate(
        octokit.pulls.list,
        {
          owner,
          repo,
          state: 'closed',
          per_page: 100
        },
        (response) => response.data.filter(pr => pr.merged_at)
      );

      const stats = {
        repoName: repoLink.repoName,
        totalMergedPRs: prs.length,
        lastChecked: repoLink.lastChecked
      };

      repoStats.push(stats);
      console.log(`✓ ${repoLink.repoName}: ${prs.length} merged PRs`);

    } catch (error) {
      console.error(`Error fetching ${repoLink.repoName}:`, error.message);
      repoStats.push({
        repoName: repoLink.repoName,
        error: error.message
      });
    }
  }

  // Sort by merged PRs (descending)
  repoStats.sort((a, b) => (b.totalMergedPRs || 0) - (a.totalMergedPRs || 0));

  console.log('\n=== Repository-wise Statistics (Decreasing Order of Merged PRs) ===\n');

  let totalPRs = 0;

  repoStats.forEach(stat => {
    if (stat.error) {
      console.log(`${stat.repoName}: Error - ${stat.error}`);
    } else {
      console.log(`${stat.repoName}: ${stat.totalMergedPRs} merged PRs`);
      totalPRs += stat.totalMergedPRs || 0;
    }
  });

  console.log('\n=== Final Analysis ===');
  console.log(`Total Repositories: ${repoStats.length}`);
  console.log(`Total Merged PRs: ${totalPRs}`);
  console.log(`Average PRs per Repository: ${(totalPRs / repoStats.filter(s => !s.error).length).toFixed(1)}`);

  // Close connection
  await mongoose.disconnect();
}

getRepoWiseStats().catch(console.error);