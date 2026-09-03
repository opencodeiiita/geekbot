function parseIssuePayload(payload, isBounty = false) {
  const item = payload.issue;
  const repo = payload.repository;

  //label extraction
  const labels = item.labels.map(l => l.name);
  const labelsText = labels.length > 0 ? labels.join(', ') : 'None';
  const lowerLabels = labels.map(l => l.toLowerCase());

  // 2. Points Calculation
  let pointsValue = 0;
  let pointsText = 'Not specified';
  
  for (const label of labels) {
    const match = label.match(/points:\s*(\d+)/i);
    if (match) {
      pointsText = match[1];
      pointsValue = parseInt(match[1], 10);
      break;
    }
  }

  let type = 'FCFS (First come first serve)';
  if (lowerLabels.some(l => l.includes('ofa') || l.includes('open-for-all'))) {
    type = 'Open for all';
  } else if (lowerLabels.some(l => l.includes('compe') || l.includes('competitive'))) {
    type = 'Competitive';
  }

  let color = 0x00ff00;
  if (pointsValue >= 31) color = 0xff0000;      // Red
  else if (pointsValue >= 21) color = 0xffa500; // Orange
  else if (pointsValue >= 11) color = 0xffff00; // Yellow

  // 5. Body Truncation (Safety limits)
  let description = item.body || 'No description provided.';
  const lines = description.split('\n');
  if (lines.length > 5) {
    description = lines.slice(0, 5).join('\n') + '\n...';
  }

  return {
    number: item.number,
    title: isBounty ? `Bounty Issue #${item.number}` : `Issue #${item.number}`,
    rawTitle: item.title,
    url: item.html_url,
    description: description,
    state: item.state,
    authorName: item.user.login,
    authorAvatar: item.user.avatar_url,
    authorUrl: item.user.html_url,
    repoName: repo.full_name,
    repoKey: repo.full_name.toLowerCase(),
    repoUrl: repo.html_url,
    labels: labels, // Pass raw labels array for randomMsg generators later
    labelsText: labelsText,
    points: pointsText,
    pointsValue: pointsValue,
    type: type,
    color: color,
    isBounty: isBounty,
    timestamp: isBounty ? new Date().toISOString() : item.created_at,
    footerText: isBounty ? 'Bounty Added' : 'Created'
  };
}

module.exports = parseIssuePayload