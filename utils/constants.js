// Constants for the Discord bot
const EMBED_COLORS = {
  DEFAULT: 0x00ff00,
  HIGH_POINTS: 0xffa500,
  VERY_HIGH_POINTS: 0xff0000,
  MEDIUM_POINTS: 0xffff00,
};

const ISSUE_TYPES = {
  FCFS: 'FCFS (First come first serve)',
  OPEN_FOR_ALL: 'Open for all',
  COMPETITIVE: 'Competitive',
};

const POINTS_THRESHOLDS = {
  MEDIUM: 11,
  HIGH: 21,
  VERY_HIGH: 31,
};

const ADMIN_ROLE_NAMES = new Set(['mentor', 'admin', 'server manager']);

const WELCOME_MESSAGE = [
  '**Welcome to the OpenCode Server!**',
  // Hey ${member}! - will be inserted dynamically
  '',
  '',
  'We at GeekHaven welcome you to your journey through open-source in this world curated by enthusiasts like you!',
  '',
  'To proceed further, follow these steps:',
  '',
  // 1. Read and abide by the rules mentioned in ${rulesMention}
  '',
  '2. Register at [Unstop](https://bit.ly/RegisterAtOpencode25)',
  '3. To get yourself registered on leaderboard login on the [GeekHaven Portal](https://events.geekhaven.in)',
  '4. Go through the Participants Rulebook for a complete tutorial/guide on how to participate',
  '5. Check out all repos at the [OpenCode GitHub portal](https://github.com/opencodeiiita)',
  // 6. Get your roles in ${rolesMention} for the topics you are interested in!
  '',
  '7. Go forth and conquer the open-source world...',
  '',
  // For any additional help ping ${mentorMention} in ${helpMention} channel
  '',
  '',
  'Regards, Team Geekhaven',
];

const CHANNEL_NAMES = {
  RULES: 'rules📃',
  ROLES: 'roles🙋',
  HELP: 'help-channel❓',
  WELCOME: 'welcome',
};

const ROLE_NAMES = {
  MENTOR: 'mentor',
};

module.exports = {
  EMBED_COLORS,
  ISSUE_TYPES,
  POINTS_THRESHOLDS,
  ADMIN_ROLE_NAMES,
  WELCOME_MESSAGE,
  CHANNEL_NAMES,
  ROLE_NAMES,
};