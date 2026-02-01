const axios = require('axios');

async function getTotalMergedPRs() {
  try {
    console.log('Fetching leaderboard data from API...');
    const response = await axios.get('https://events.geekhaven.in/back/api/v1/events/Opencode/leaderboard', {
      timeout: 10000,
      headers: {
        'User-Agent': 'GeekBot/1.0 (Discord Bot for OpenCode)'
      }
    });

    const leaderboardData = response.data;

    // The API returns data wrapped in an object: { status, message, data: [...] }
    const leaderboard = leaderboardData.data.map((participant, index) => ({
      rank: participant.position,
      name: participant.name || participant.githubid,
      score: participant.points,
      githubid: participant.githubid,
      prmerged: participant.prmerged,
      avatarUrl: participant.avatarUrl,
      position: index + 1
    }));

    // Calculate total merged PRs
    const totalMergedPRs = leaderboard.reduce((total, participant) => {
      return total + (participant.prmerged || 0);
    }, 0);

    // Calculate total points
    const totalPoints = leaderboard.reduce((total, participant) => {
      return total + (participant.score || 0);
    }, 0);

    // Count participants with at least one merged PR
    const activeParticipants = leaderboard.filter(participant => (participant.prmerged || 0) > 0).length;

    // Calculate additional statistics
    const participationRate = (activeParticipants / leaderboard.length * 100).toFixed(2);
    const avgPRsPerActive = activeParticipants > 0 ? (totalMergedPRs / activeParticipants).toFixed(2) : 0;
    const avgPointsPerParticipant = leaderboard.length > 0 ? (totalPoints / leaderboard.length).toFixed(2) : 0;
    const avgPointsPerActive = activeParticipants > 0 ? (totalPoints / activeParticipants).toFixed(2) : 0;

    // Sort scores for percentile calculations
    const scores = leaderboard.map(p => p.score).sort((a, b) => a - b);
    const medianScore = scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0;
    const top10Percentile = scores.length > 0 ? scores[Math.floor(scores.length * 0.9)] : 0;

    console.log(`Total participants: ${leaderboard.length}`);
    console.log(`Active participants (with merged PRs): ${activeParticipants}`);
    console.log(`Total merged PRs: ${totalMergedPRs}`);
    console.log(`Total points: ${totalPoints}`);
    console.log(`Participation rate: ${participationRate}%`);
    console.log(`Average PRs per active participant: ${avgPRsPerActive}`);
    console.log(`Average points per participant: ${avgPointsPerParticipant}`);
    console.log(`Average points per active participant: ${avgPointsPerActive}`);
    console.log(`Median score: ${medianScore}`);
    console.log(`90th percentile score: ${top10Percentile}`);

    return {
      totalParticipants: leaderboard.length,
      activeParticipants: activeParticipants,
      totalMergedPRs: totalMergedPRs,
      totalPoints: totalPoints,
      participationRate: participationRate,
      avgPRsPerActive: avgPRsPerActive,
      avgPointsPerParticipant: avgPointsPerParticipant,
      avgPointsPerActive: avgPointsPerActive,
      medianScore: medianScore,
      top10Percentile: top10Percentile
    };

  } catch (error) {
    console.error('Error fetching leaderboard from API:', error.message);
    throw new Error('Failed to fetch leaderboard data from API. Please try again later.');
  }
}

// Run the function
getTotalMergedPRs().then(result => {
  console.log('\nSummary:');
  console.log(`Total Participants: ${result.totalParticipants}`);
  console.log(`Active Participants (with merged PRs): ${result.activeParticipants}`);
  console.log(`Total Merged PRs: ${result.totalMergedPRs}`);
  console.log(`Total Points: ${result.totalPoints}`);
  console.log(`Participation Rate: ${result.participationRate}%`);
  console.log(`Average PRs per Active Participant: ${result.avgPRsPerActive}`);
  console.log(`Average Points per Participant: ${result.avgPointsPerParticipant}`);
  console.log(`Average Points per Active Participant: ${result.avgPointsPerActive}`);
  console.log(`Median Score: ${result.medianScore}`);
  console.log(`90th Percentile Score: ${result.top10Percentile}`);
}).catch(console.error);