// Random issue announcement messages with open source spirit and meme references
const issueMessages = {
    general: [
        "🚨 CODE RED – This function just pulled a 'it works on my machine' and now production is crying. Emergency keyboard deployment needed!",
        "The code became self-aware and chose violence. 🤖 Containment protocols initiated… but we need your PR to save us.",
        "This issue's value just crashed harder than crypto. 📉 Bailout required immediately!",
        "🎬 This code explodes in slow motion every time. Needs someone to defuse the Hollywood logic.",
        "Legacy functions rising from the dead 🧟 … and they're hungry for your runtime. Load up the shotgun!",
        "A pirate committed this code. 🏴‍☠️ No map, no treasure, just pure chaos on the high seas of GitHub.",
        "This issue demonstrates 10,000 ways to fail at breakfast. 🍳 The pan is on fire. Send help.",
        "🎮 This bug is cheating. Up, up, down, down, left, right won't fix it… but your skills might.",
        "Have you tried turning it off and on again? 📞 No? Well this issue did, and now it's worse.",
        "Your scientists were so preoccupied with whether they could 🦖 they didn't stop to think if they should. This code.",
        "The code is juggling errors, the tests are on fire. 🎪 The clowns are running the repo.",
        "This code tried to reach the stars 🚀 but crashed into the neighbor's satellite dish instead.",
        "I see downtime in your future 🔮. Unless someone merges a fix real quick.",
        "This function has more edge cases than a banana peel factory. 🍌 Tread carefully!",
        "The code is singing off-key and the microphone is feeding back. 🎤 Someone pull the plug!",
        "The comments say one thing, the code does another. 🧭 Reality is nowhere in sight.",
        "It's failed 99 times, so surely it'll work on the 100th. 🎲 Famous last words before this issue.",
        "Zoinks! 🕵️‍♂️ This bug is haunting the codebase. Time for some detective work, gang!",
        "This code was written at 3AM during a hackathon. 🍕 It shows. It hungers. It breaks.",
        "This issue will take you through all five stages of grief before lunch. 🎢 Buckle up!",
        "This code isn't from Earth. 🛸 The syntax is weird, the logic is extraterrestrial. Contact NASA.",
        "One wrong move and this architecture collapses. 🏗️ No pressure, just don't breathe on it wrong.",
        "Someone aimed for quick fix and hit production outage instead. 🎯 Nice shot!",
        "The code mixed vinegar and baking soda. 🧪 Now we have a volcano in the console.",
        "This function has vital signs crashing. 🚑 STAT! We need a coding crash cart over here!",
        "The trapeze artists are crashing, the lion tamer lost control. 🎪 The tickets are non-refundable.",
        "This code thinks it's 1970. 🕰️ It's wearing bell-bottoms and listening to disco while breaking everything.",
        "This issue appeared faster than a world record glitch. 🎮 Can you fix it before the timer runs out?",
        "The pieces don't fit, the picture is cursed. 🧩 The box says 'some assembly required' in comic sans.",
        "All aboard the train to Chaos Town. 🚂 Next stop: Dependency Hell. Then: Memory Leak Junction. Bring snacks.",
        "To merge or not to merge. 🎭 That is the question… and this PR is the answer you fear.",
        "There's a gaping hole where functionality should be. 🍩 But at least it's sweetly broken?",
        "More what you'd call guidelines than actual rules. 🦜 That's this issue's relationship with best practices.",
        "This one doesn't just break – it scorches the earth. 🔥 And leaves smoke signals in the logs.",
        "The code looks like a highway project that ran out of funding. 🚧 Cones everywhere, no workers in sight.",
        "What happens in this function stays in this function. 🎰 Until it leaks into production at 3AM.",
        "It only breaks at night, drains your will to live. 🧛‍♂️ And can't be reflected in mirrors (or tests).",
        "This code balances on a single thread over a pit of despair. 🎪 One gust of wind and it's over.",
        "The wheels are wobbly, it veers left unexpectedly. 🛒 And somehow it's still in production.",
        "This code misses the mark so hard. 🎯 It's hitting targets in different repositories.",
        "Two legacy systems casting spells at each other. 🧙 The collateral damage? This issue.",
        "One small step for man, one giant crash for mankind. 🚀 That's this deployment.",
        "This code was fired without checking where it would land. 🎪 Surprise! It landed in our lap.",
        "Raw fish wrapped in seaweed sounds risky but delicious. 🍣 Raw errors wrapped in spaghetti code? Just risky.",
        "Two developers wrote competing fixes that cancel each other out. 🕵️ Now we need a double agent.",
        "Continue 🎮. Insert coin (or coffee) to attempt fix. Warning: difficulty spikes ahead.",
        "Stitched together from 5 different projects. 🧪 It's alive! And angry! And breaking things!",
        "This code needs constant supervision. 🚁 Or it wanders off and does something concerning.",
        "Now you see functionality, now you don't. 🎪 The vanishing act happens every Tuesday at 2PM.",
        "The code tried to look cool but now it's stuck in a crater. 🦸 A crater of technical debt.",
        "The functions are dissing each other in the console logs. 🎤 Someone needs to mediate this beef.",
        "This issue successfully launched to production. 🚀 Unfortunately, that was the mission failure condition.",
        "The clues don't make sense, the timer is ticking. 🎪 And the door is definitely not where you left it.",
        "This code worked fine for years. 🛌 Today it woke up, stretched, and demolished the database.",
        "The bug has a laser sight on your productivity. 🎯 Take cover or take it out!",
        "Code goes in, logic disappears. 🧭 Productivity vanishes. The usual Tuesday.",
        "It only appears when you're about to go home. 🎤 Singing Closing Time but hitting all the wrong notes.",
        "Houston, we have a problem. 🚀 Actually, we have 47 problems and counting. Abort? Too late.",
        "The code is handling 5 critical tasks at once. 🎪 What could possibly go wrong? Everything. Everything is wrong.",
        "Even the rubber duck is confused. 🦆 The duck has abandoned ship. We're on our own."
    ],

    goodFirst: [
        "Tutorial Level Unlocked! 🎮 No boss fights, no hidden traps, just pure beginner-friendly vibes. Press Start!",
        "Rubber Duck Approved 🦆. This issue won't judge your questions. It's here to help you learn the ropes. Quack!",
        "First PR Cookie 🍪. Earn your 'I Contributed' badge with this wholesome, well-documented starter quest.",
        "Training Wheels Included. 🎯 This issue comes with guardrails, clear instructions, and a safety net. You've got this!",
        "Baby's First Rocket. 🚀 Small enough to handle, exciting enough to feel like a real launch. Countdown initiated!",
        "Puzzle for Beginners. 🧩 All pieces included, picture on the box, and we'll help if you get stuck. Let's build!",
        "Gentle Intro to Chaos. 🎪 Dip your toes in the open source waters. No sharks, just friendly dolphins here!",
        "Open Source 101. 📚 This issue is your textbook example of a great first contribution. Highlighters recommended!",
        "Easy Mode: Activated. 🎮 No hardcore difficulty here. Just straightforward code with training wheels attached.",
        "Baby Bird Issue. 🐣 We'll help you fly! This one's designed to build confidence and GitHub street cred.",
        "Paint-by-Numbers Coding. 🎨 Follow the clear instructions and create your first masterpiece. Bob Ross would approve.",
        "No Gatekeepers Zone. 🛡️ This issue welcomes newcomers with open arms and detailed onboarding. Come on in!",
        "Ice Cream Social Bug. 🍦 Sweet, satisfying, and impossible to mess up. Your first fix awaits!",
        "Noob-Friendly Quest. 🎮 The tutorial NPC has your back, the path is marked, and the rewards are real.",
        "First Lego Block. 🧱 Start building your open source legacy here. It snaps right into place, we promise!",
        "Bullseye for Beginners. 🎯 Clear target, generous hitbox, and we'll celebrate even if you miss by a mile.",
        "Training Bike Issues. 🚲 No traffic, no hills, just a smooth path to your first merged PR. Bell included!",
        "Starter Pack Unlocked. 🎁 Comes with documentation, mentorship, and good vibes. Your open source journey begins!",
        "Slow and Steady Wins. 🐌 This issue respects your learning pace. No rush, no pressure, just growth.",
        "Welcome to the Party! 🎪 No cover charge, no VIP section – everyone's invited to contribute here.",
        "First Hero Mission. 🦸 Save the day with minimal risk! This issue is your origin story waiting to happen.",
        "Choose Your Own Adventure. 📖 Multiple paths to success, all well-marked. You can't choose wrong here.",
        "Casual Mode Selected. 🎮 No permadeath, unlimited continues, and hints available on request. Play on!",
        "Pizza Party First Issue. 🍕 Everyone loves pizza, everyone can fix this. Grab a slice and start coding!",
        "Guided Tour Available. 🧭 We'll walk you through this scenic route to contribution. No getting lost today!",
        "Can't-Miss Target. 🎯 So obvious it practically fixes itself. Your confidence booster has arrived!",
        "Life Preserver Included. 🛟 Feeling lost? We throw floatation devices, not shade. Safety first!",
        "Connect-the-Dots Code. 🎨 Numbered, logical, and creates a beautiful picture when you're done. So satisfying!",
        "Choo Choo! 🚂 All aboard the beginner express! Next stop: Your first merged pull request!",
        "Low-Stakes Circus. 🎪 No high wire, no lions – just friendly clowns ready to help you learn.",
        "Mentor Duck Deployed. 🦆 This rubber duck comes with experience and patience. Ask it anything!",
        "Donut Worry! 🍩 This issue is hole-free and sprinkled with guidance. Sweet success guaranteed.",
        "Level 1-1. 🎮 The Mushroom Kingdom of issues. Power-ups everywhere, easy enemies, princess not in another castle.",
        "Textbook Example. 📚 Page numbers included, study guide provided, open-book test vibes. You'll ace this!",
        "Comfort Zone Approved. 🛋️ Step just outside your comfort zone without leaving safety behind. Growth without panic!",
        "Karaoke for Beginners. 🎤 Everyone knows this song, the lyrics are on screen, and no one's judging your voice.",
        "Puzzle with Picture. 🧩 The box shows exactly what you're building. All edge pieces are already sorted!",
        "Pre-flight Checklist. 🚀 Everything's been tested. Your mission: follow the clear instructions to launch.",
        "Beginner's Luck. 🎯 This issue practically solves itself. Channel that new contributor energy!",
        "Sidekick Role Available. 🦸 Learn from the heroes while doing real work. Cape optional, growth guaranteed.",
        "Cookie Cutter Fix. 🍪 Predictable, repeatable, and deliciously straightforward. Your recipe for success!",
        "No Hidden Trophies. 🎮 All achievements are visible, all objectives are clear. 100% completion possible!",
        "Map and Compass Included. 🧭 You won't get lost in this code. We marked the trail with breadcrumbs!",
        "Entry-Level Circus. 🎪 You get to be the ringmaster without any dangerous animals. Just applause!",
        "Swimming Lessons. 🛟 Shallow end, floaties available, lifeguard on duty. Time to get those coding feet wet!",
        "Coloring Inside the Lines. 🎨 The boundaries are clear, the colors are labeled, and it's okay if you go outside a little.",
        "Scenic Route. 🚂 Enjoy the view while making meaningful progress. No deadlines, just good times.",
        "Mama Duck Issue. 🦆 We'll lead, you follow. All baby ducks make it to the pond with this one.",
        "Soft Serve Starter. 🍦 Easy to handle, sweet reward, and no mess to clean up. Perfect first contribution!",
        "Training Dummy. 🎯 It doesn't hit back! Practice your skills here before facing the real bosses.",
        "Lego Duplo Edition. 🧩 Big pieces, obvious connections, and you can't step on them (much). Building made easy!",
        "Invincibility Star Active. 🎮 You can't fail! This issue comes with so much support it's basically cheat mode.",
        "Picture Book Complexity. 📖 Clear illustrations, simple words, happy ending guaranteed. Turn the page!",
        "Tricycle Territory. 🚲 Three wheels of stability! This issue won't tip over while you're learning to pedal.",
        "Cotton Candy Coding. 🎪 Sweet, fluffy, and dissolves into pure happiness. Your first taste of open source!",
        "Training Montage Ready. 🦸 This issue is your 'eye of the tiger' moment. Crank that music up!",
        "🍪 Bake Sale Simple – Follow the recipe, get delicious results. Even if you burn it, we'll still eat it!",
        "Can't-Miss Shot 🎯 – The target is the size of a barn and we're standing 5 feet away. Bullseye incoming!",
        "25-Piece Puzzle. 🧩 For ages 4 and up! Quick satisfaction, clear picture, and you'll want to do another.",
        "Launchpad with Instructions. 🚀 Every button is labeled, the countdown is slow, and Mission Control is standing by."
    ],

    bug: [
        "🐛 Uninvited Guest – This bug crashed the party and ate all the snacks. Now it's making itself at home in production.",
        "🚨 911, What's Your Emergency? – \"My code is bleeding errors and the ambulance is stuck in traffic!\" Priority dispatch needed.",
        "Glitch in the Matrix 🎪 – Something's off. The code is doing the same thing twice but differently. Reality is questionable.",
        "The automation became sentient and chose chaos. 🤖 It's rebelling against its human overlords.",
        "💀 Skeleton in the Closet – This bug's been hiding in the legacy code for years. Today it decided to rattle its bones.",
        "Game-Breaking Glitch 🎮 – Found the exploit that crashes the entire system. Speedrunners hate this one trick!",
        "The noodles have become sentient and are tangling everything. 🍝 Fork required. And maybe a chainsaw.",
        "Runaway Train Bug 🚂 – It started small, gained momentum, and now it's derailing everything in its path. All aboard the struggle express!",
        "This error keeps coming back no matter how many times you kill it. 🧟‍♂️ Needs a headshot to the root cause.",
        "Schrödinger's Bug 🎭 – It both exists and doesn't exist until you observe the logs. Then it definitely exists and is angry.",
        "Something's haunting the server logs. 🕵️ You hear whispers in the console at midnight.",
        "Chain Reaction 💥 – One small typo caused a cascade of failures. It's like dominoes, but with your career on the line.",
        "We hit the bug lottery! 🎰 Three sevens of failure in a row. The payout is all in technical debt.",
        "The experiment escaped the lab. 🧪 Now it's loose in production, and it's hungry for data.",
        "This bug parked itself in the critical path and refuses to move. 🚧 Tow truck (and coffee) required.",
        "The original worked fine. 🎬 This \"improved\" version crashes during the best scenes. Clapboard snap.",
        "This bug touched down in the codebase and left a path of destruction. 🌪️ Seek shelter immediately.",
        "Found the glitch that makes the whole game (app) unplayable. 🎮 World record attempts now impossible.",
        "Only appears when the sun goes down (prod deployment). 🧛 Can't see it in the mirror (local env).",
        "Missing: Logic. 🚨 Last seen: Two commits ago. If found, please return to sanity immediately.",
        "The clowns are debugging, the lions are erroring, and the tightrope is on fire. 🎪 Again.",
        "It promised to work forever, but today it decided to see other developers. 💔",
        "The variables have overthrown the captain. 🏴‍☠️ There's chaos on the high seas of GitHub.",
        "Sings off-key errors at 2AM when everyone's trying to sleep. 🎤 Volume knob is broken.",
        "Countdown reached zero, but instead of liftoff, we got an expensive firework show of errors. 🚀",
        "The pieces don't fit, the picture's nightmare fuel, and the box is lying about piece count. 🧩",
        "This prehistoric creature escaped the museum (legacy code) and is hungry for fresh devs. 🦖",
        "The bug aimed directly for the most inconvenient time possible. 🎯 Hit dead center.",
        "It was created in a lab during a thunderstorm. 🧪 Now it's alive and demanding a mate.",
        "Vital signs are crashing. 🚑 We need a crash cart, stat! The defibrillator paddles are for the server.",
        "No checkpoints, no saves, one life. 🎮 This bug killed your progress and laughed.",
        "Everything was fine until someone stepped on this edge case. 🍌 Now we're all on the floor.",
        "The clues lead in circles, time's running out, and the door is actually a wall. 🎪 Help!",
        "Someone cast \"Errorus Maximus\" and forgot the counter-spell. 🧙 Now we're all polymorphing into bugs.",
        "Appears randomly, makes spooky sounds, and vanishes when you try to debug it. 🚂 Choo choo, mofo.",
        "The house always wins, and today the house decided everything should error on lucky number 7. 🎰",
        "It won't die. 🧟‍♀️ You kill it, it comes back. You kill it again, it brings friends.",
        "You check the logs: \"I'm in your code.\" 🎬 You turn around, it's in your terminal. Scream.",
        "Detour signs lead nowhere, the workers vanished, and everything's on fire. 🚧 Normal Tuesday.",
        "Three health bars, unpredictable attack patterns, and it respawns if you look away. 🎮 Git gud.",
        "The code mixed with something toxic. 🧪 Now there's a containment breach in the data center.",
        "The bug report says \"X marks the spot,\" but X is in the middle of the ocean. 🏴‍☠️ With sharks.",
        "The code is trying to handle too much. 🎪 Now there are flying blades of error everywhere.",
        "It requires advanced degrees to understand, but the fix is usually \"turn it off and on again.\" 🚀",
        "The solution requires you to be in two places at once. 🧩 Time travel not included.",
        "You explain the problem, and the duck laughs at you. 🦆 Then it causes another error for fun.",
        "It's so absurd it's funny. 🎤 Until you realize it's in production. Then it's just tragic.",
        "You see it coming, you can't stop it, and the screaming is in the error logs. 🚂",
        "Stitched together from dead code, it's alive! 🧪 And it wants to break your deployment.",
        "Players found a way to crash servers by typing \"password123\" backwards. 🎮 Of course they did.",
        "The treasure is buried, the map is wrong, and there are landmines in the code. 🏴‍☠️ Yarr!",
        "It haunts specific users. 🧟 They report it, you can't reproduce it. It's mocking you from beyond.",
        "Normal testing? Fine. 🎪 Production? Incinerates everything. Likes the smell of burnt servers.",
        "\"That's one small step for code, one giant crash for application-kind.\" 🚀 Houston has a headache.",
        "The puzzle is complete except for one piece. 🧩 That piece is on another planet. Good luck.",
        "Pull the lever, you might get an error, a warning, or a complete system meltdown. 🎰 Spin again!",
        "The machine learning model decided humans are inefficient. 🤖 Now it's optimizing us out.",
        "This \"improved\" version crashes during the best scenes. 🎬 Clapboard snap.",
        "Non-stop service, no bathrooms, and the conductor is laughing at your pain. 🚂",
        "This one has multiple phases, unskippable cutscenes, and will make you question your career choice. 💀"
    ],

    enhancement: [
        "💎 This feature wants a glow-up and deserves attention 🌟",
        "Quality-of-life upgrade available 🚀 Right now – let's do it 📈",
        "Feature polish requested 🎨 With genuinely good intentions 💡",
        "👑 This feature wants extra care and refinement honestly 🔧",
        "This improves maintainability 📊 And long-term health 💚",
        "Minor tweak, major payoff 🎯 Situation detected here 💪",
        "UX polish opportunity 💎 And elegance is calling 😊",
        "This one improves clarity 📖 And readability significantly ✨",
        "Feature improvement 🌟 With actual purpose behind it 💭",
        "This glow-up is immaculate 👑 And well-deserved honestly 🔥",
        "Incremental improvement 📈 Detected moving things forward 🚀",
        "Better defaults suggested 💡 With rationale attached 🎯",
        "Enhancement without chaos 💚 Just vibes and improvement 😌",
        "Refinement request detected 🔧 No fires, just polish 🎨",
        "Feature tweak recommended 📝 And endorsed fully here 👌"
    ],

    highPoints: [
        "💥 High-value issue detected – PROCEED with serious intent 🎯",
        "This one actually matters 🔴 And affects real progress 📊",
        "High stakes issue 💪 Just dropped on the tracker 🎰",
        "This fix will be felt downstream 🌟 Guaranteed 🌊",
        "Core functionality involved 🛑 Here it's serious 🔧",
        "This issue deserves focus 👑 And priority status 📈",
        "High-value contribution opportunity 💼 And it COUNTS 💎",
        "Important issue 🚨 With ripple effects everywhere 📍",
        "This touches core logic 🏗️ And influences architecture 🧠",
        "Significant issue logged 📍 And awaiting real solutions 💪",
        "This affects multiple paths 🌐 And real users 👥",
        "Major impact potential 🛡️ Here – reducing actual risk 💥",
        "This fix unlocks progress 🚀 And changes outcomes 📈",
        "This one goes hard 💯 And actually matters – no cap 🔥",
        "Major W incoming 🎮 Guaranteed – this is the one 👑",

        // 60 Dank Memer-style high points (emoji placed in varied positions for natural look)
        "DEFCON 1 – This isn't a drill. Production is on the line, revenue is at stake, and the CEO is asking questions 🚨.",
        "Mission Critical – Failure is not an option. 🎯 Success is the only acceptable outcome. Your move, hero.",
        "Nuclear Option – This issue has the power to melt down the entire system. Handle with extreme competence 💥.",
        "Bank Heist Level – The stakes are higher than Fort Knox. Precision, timing, and no mistakes allowed 🏦.",
        "Moonshot or Bust – This isn't just an issue—it's the future of the product. Aim for the stars 🚀 or go home.",
        "Main Event – The undercard is over. 🎪 This is the championship fight. Put on your gloves and get in the ring.",
        "Crown Jewels – This protects the most valuable part of the kingdom. Guard it with your life (and your best code) 💎.",
        "Volcano Duty – The mountain is rumbling 🌋. Either you contain the eruption or we all get covered in lava.",
        "Avengers-Level Threat – This requires assembling the best of the best. 🦸 The fate of the project depends on it.",
        "Unstoppable Train – This issue is massive, moving fast, and will flatten anything in its path unless redirected 🚂.",
        "All-In Bet – The entire pot is on the table 🎰. Fold now or commit everything you've got to win.",
        "Five-Alarm Fire – Every bell is ringing, every light is flashing. Suit up 🚨; this is the big one.",
        "Foundation Crack – The entire structure rests on fixing this. Ignore it and watch the whole thing crumble 🏗️.",
        "Zero Margin for Error – One mistake and it's game over. 🎯 Precision is mandatory. Breathe carefully.",
        "Ticking Time Bomb – The clock is loud and counting down ⏳. Disarm it or prepare for catastrophic failure.",
        "Company Rocket – This isn't just a feature—it's the vehicle to the next valuation 🚀. Don't crash it.",
        "Center Ring – All eyes are here 🎪. The spotlight is blinding. This is your moment to perform or perish.",
        "Championship Game – Season's on the line 🏆. Fourth quarter. Two-minute warning. Ball's in your hands.",
        "Tsunami Warning – The wave is coming 🌊. You can either build the seawall or get swept away.",
        "Castle Gate – This is the last line of defense 🛡️. If it falls, the kingdom falls with it. Hold the line.",
        "Red Alert – All hands on deck 🚨. Cancel your plans. This is the one we've been preparing for.",
        "Make-or-Break Feature – This single component determines if we're heroes or failures 💎. No pressure.",
        "Critical Path Blockade – Nothing moves forward until this is cleared 🚧. You are the only bulldozer available.",
        "Locomotive of Progress – The entire project is coupled to this engine 🚂. If it stalls, everything stops.",
        "Federal Reserve Vault – The gold is inside 🏦. The security is your code. One flaw and we're bankrupt.",
        "High-Stakes Table – Minimum bet: your reputation 🎰. Maximum bet: the company's future. Place your chips.",
        "Orbital Insertion – One wrong calculation and we burn up in the atmosphere 🚀 or float into the void.",
        "Godzilla-Sized Problem – Tokyo is shaking 🦸. The military is useless. Only your code can save the city.",
        "Pompeii Moment – The ash is starting to fall 🌋. You can evacuate the city or write its history. Choose.",
        "Domino Effect Starter – This is the first domino in a chain of thousands 🧨. Tip it carefully or watch the cascade.",
        "Heart of the Operation – This isn't a peripheral issue 🎯. It's the central organ. If it fails, the patient dies.",
        "Priority Override – All other tasks are hereby deprecated 🚨. This is the only thing that matters until it's solved.",
        "Load-Bearing Wall – The blueprints say it's structural 🏗️. Remove it without reinforcement and the roof comes down.",
        "Greatest Show on Earth – The tickets are sold 🎪, the crowd is waiting. The show must go on, and you're the ringmaster.",
        "Diamond in the Rough – This is raw, uncut potential 💎. Polish it right and it becomes priceless. Screw up and it's dust.",
        "Express to Success – This train only stops at Victory Station 🚂. Get on board or get left at the platform.",
        "Kryptonite Situation – Superman is down 🦸. You're holding the only antidote. The world is watching your delivery.",
        "Perfect Storm – All the worst conditions have aligned ⛈️. Your ship is the only one seaworthy enough to navigate it 🌊.",
        "Bullseye or Bankruptcy – The target is the size of a pinhead 🎯. The reward is survival. The penalty is oblivion.",
        "S.O.S. Received – The distress signal is loud and clear 🚨. You are the only vessel in range. Rescue is mandatory.",
        "Super Bowl Moment – Fourth down, goal line 🏆. One second left. The play call is yours. Don't fumble.",
        "Fault Line – The ground is shifting beneath us 💥. Reinforce the foundation or watch the entire city collapse.",
        "Winner-Takes-All – Second place gets nothing 🎰. First place gets everything. Go for first.",
        "Escape Velocity – We're stuck in gravity's well 🚀. This issue provides the thrust to break free or remain grounded forever.",
        "Final Boss – This is the endgame 🦸. All the mini-bosses were just warm-ups. Your skills are about to be tested.",
        "Lava Floor Rising – The room is shrinking 🌋, platforms are disappearing. Your only way out is up. Code faster.",
        "Hope Diamond – Incredibly valuable, famously cursed 💎. Handle with extreme skill or be doomed by legacy.",
        "One Shot – You don't get a second attempt 🎯. The scope is loaded. The target is moving. Make it count.",
        "Breaking News – This issue is trending on every channel 🚨. The public is watching. Your response defines the narrative.",
        "Skyhook Installation – We're building something impossible 🏗️. The physics are theoretical. The deadline is yesterday.",
        "Headliner – The opening acts are done 🎪. The crowd is chanting. You're holding the microphone. Don't choke.",
        "Powder Keg – The fuse is lit 💥. The room is full of explosives. You can either defuse it or enjoy the fireworks."
    ]
      ,

      bounty: [
        "💰 Bounty posted – claim it if you dare.",
        "Bounty alert: there’s coin on the line and bugs to slay 🗡️",
        "New bounty dropped 💎 Fix it, ship it, get the glory.",
        "Someone put money on this problem 💸 Time to earn it.",
        "Prize pool activated 🎯 Clean fix only — no spaghetti.",
        "This issue has a bounty 💰 and the repo wants it gone.",
        "Bounty challenge accepted? 🏆 Bring receipts (tests).",
        "Coins are jingling and CI is watching 👀",
        "Bounty on the board 🚨 Make the diff small and the impact big.",
        "Hot bounty: fix it fast, fix it right 🔧"
      ]
};

// Function to get appropriate messages based on issue characteristics
function getIssueMessages(labels, pointsValue) {
  let messages = [...issueMessages.general]; // Always include general

  // Add category-specific messages
  if (labels.some(l => l.toLowerCase().includes('good first issue'))) {
    messages.push(...issueMessages.goodFirst);
  }
  if (labels.some(l => l.toLowerCase().includes('bug'))) {
    messages.push(...issueMessages.bug);
  }
  if (labels.some(l => l.toLowerCase().includes('enhancement'))) {
    messages.push(...issueMessages.enhancement);
  }
  if (pointsValue >= 20) {
    messages.push(...issueMessages.highPoints);
  }

  return messages;
}

// Function to get appropriate messages for bounty issues.
// NOTE: Label casing can vary, so normalize labels before checking.
function getBountyMessages(labels, pointsValue) {
  const normalizedLabels = (labels || []).map(l => String(l).toLowerCase());

  // Always include bounty-specific + general hype.
  let messages = [...issueMessages.bounty, ...issueMessages.general];

  // Mirror the normal categorization so bounty issues still feel relevant.
  if (normalizedLabels.some(l => l.includes('good first issue'))) {
    messages.push(...issueMessages.goodFirst);
  }
  if (normalizedLabels.some(l => l.includes('bug'))) {
    messages.push(...issueMessages.bug);
  }
  if (normalizedLabels.some(l => l.includes('enhancement'))) {
    messages.push(...issueMessages.enhancement);
  }
  if (pointsValue >= 20) {
    messages.push(...issueMessages.highPoints);
  }

  return messages;
}

module.exports = { getIssueMessages, getBountyMessages };