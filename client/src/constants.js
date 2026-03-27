// ============================================
// DESIGN TOKENS
// ============================================
export const C = {
  // ── Core surfaces ──
  bg: "#0a0a0c",
  surface: "#141416",
  surfaceLight: "#1c1c1f",
  border: "#222226",
  // ── Text ──
  text: "#e8e0d4",
  textMuted: "#7a756d",
  textDim: "#4a4640",
  // ── Accent: Gold (primary) ──
  gold: "#c9a84c",
  goldDark: "#a08838",
  goldFaint: "rgba(201, 168, 76, 0.12)",
  // ── Accent: Functional ──
  xp: "#c9a84c",
  green: "#4a7c50",
  greenFaint: "rgba(74, 124, 80, 0.15)",
  blue: "#4a6a94",
  blueFaint: "rgba(74, 106, 148, 0.12)",
  purple: "#6b4a8c",
  purpleFaint: "rgba(107, 74, 140, 0.12)",
  red: "#8b3030",
  // ── Cards & containers (used sparingly) ──
  card: "#141416",
  cardBorder: "#222226",
  // ── Backwards compat (old names used by other screens) ──
  tabStore: "#c9a84c",
  tabBattle: "#8b3030",
  ritualDone: "#4a7c50",
  ritualPending: "#1c1c1f",
  ritualPendingBorder: "#222226",
};

export const TABS = [
  { key: "store", label: "Store", icon: "/tab-store.png" },
  { key: "quests", label: "Quests", icon: "/tab-quests.png" },
  { key: "battle", label: "Arena", icon: "/tab-battle.png" },
  { key: "avatar", label: "Avatar", icon: "/tab-avatar.png" },
  { key: "guild", label: "Guild", icon: "/tab-guild.png" },
];

export const CLASSES = {
  warrior:    { emoji: "⚔️", color: "#ef4444", title: "Warrior",    desc: "Strength and discipline define you." },
  ranger:     { emoji: "🏹", color: "#22c55e", title: "Ranger",     desc: "Swift, adaptable, always moving." },
  sage:       { emoji: "📖", color: "#3b82f6", title: "Sage",       desc: "Knowledge is your greatest weapon." },
  monk:       { emoji: "🕯️", color: "#a855f7", title: "Monk",       desc: "Inner peace radiates outward." },
  rogue:      { emoji: "🗡️", color: "#f59e0b", title: "Rogue",      desc: "Charm and cunning in equal measure." },
  paladin:    { emoji: "🛡️", color: "#f97316", title: "Paladin",    desc: "Strength tempered by devotion." },
  strategist: { emoji: "🎯", color: "#ec4899", title: "Strategist", desc: "Three moves ahead, always." },
    outrider:   { emoji: "🌍", color: "#14b8a6", title: "Outrider",   desc: "Moves through the frontier on instinct and faith." },
    templar:    { emoji: "⚡", color: "#6366f1", title: "Templar",    desc: "Scholar and soldier forged as one." },
    oracle:     { emoji: "🔮", color: "#7c3aed", title: "Oracle",     desc: "Sees the pattern others miss." },
  warden:     { emoji: "🗻", color: "#78716c", title: "Warden",     desc: "Immovable, watchful, enduring." },
};

export const RANK_TITLES = {
  1: "Novice", 5: "Initiate", 10: "Apprentice", 15: "Journeyman", 20: "Adept",
  25: "Veteran", 30: "Elite", 35: "Champion", 40: "Legend", 50: "Myth",
};

export function getRank(level) {
  const milestones = [50, 40, 35, 30, 25, 20, 15, 10, 5, 1];
  for (const m of milestones) {
    if (level >= m && RANK_TITLES[m]) return RANK_TITLES[m];
  }
  return "Novice";
}

export const ACTIVITY_STAT_MAP = {
  "Bodyweight Workout": "str",
  "Walk/Jog 20min": "agi",
  "Read 20min": "int",
  "Pray/Meditate 10min": "spi",
  "Reach Out": "cha",
};

export const RITUAL_QUOTES = {
  "Bodyweight Workout": [
    { text: "The last three or four reps is what makes the muscle grow.", author: "Arnold Schwarzenegger" },
    { text: "Strength does not come from the body. It comes from the will.", author: "Gandhi" },
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "What hurts today makes you stronger tomorrow.", author: "Jay Cutler" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
    { text: "No man has the right to be an amateur in the matter of physical training.", author: "Socrates" },
    { text: "The resistance that you fight physically in the gym strengthens you everywhere.", author: "Arnold Schwarzenegger" },
    { text: "Fall down seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  ],
  "Walk/Jog 20min": [
    { text: "An early morning walk is a blessing for the whole day.", author: "Henry David Thoreau" },
    { text: "All truly great thoughts are conceived while walking.", author: "Friedrich Nietzsche" },
    { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "Walking is man's best medicine.", author: "Hippocrates" },
    { text: "If you are in a bad mood, go for a walk. If you are still in a bad mood, go for another walk.", author: "Hippocrates" },
    { text: "Everywhere is within walking distance if you have the time.", author: "Steven Wright" },
    { text: "In every walk with nature one receives far more than he seeks.", author: "John Muir" },
    { text: "Solvitur ambulando — it is solved by walking.", author: "St. Augustine" },
    { text: "I only went out for a walk and finally concluded to stay out till sundown.", author: "John Muir" },
    { text: "The world reveals itself to those who travel on foot.", author: "Werner Herzog" },
  ],
  "Read 20min": [
    { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
    { text: "A book is a dream you hold in your hand.", author: "Neil Gaiman" },
    { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
    { text: "The man who does not read has no advantage over the man who cannot read.", author: "Mark Twain" },
    { text: "Reading furnishes the mind only with materials of knowledge; it is thinking that makes what we read ours.", author: "John Locke" },
    { text: "Books are a uniquely portable magic.", author: "Stephen King" },
    { text: "I find television very educating. Every time someone turns it on, I go read a book.", author: "Groucho Marx" },
    { text: "Reading is an exercise in empathy.", author: "Malorie Blackman" },
  ],
  "Pray/Meditate 10min": [
    { text: "The soul that is attached to anything, however much good there may be in it, will not arrive at the liberty of the divine.", author: "St. John of the Cross" },
    { text: "Quiet the mind and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
    { text: "Be still and know that I am God.", author: "Psalm 46:10" },
    { text: "Prayer is not asking. It is a longing of the soul.", author: "Gandhi" },
    { text: "The more you pray, the less you'll panic.", author: "Rick Warren" },
    { text: "Meditation is the tongue of the soul and the language of our spirit.", author: "Jeremy Taylor" },
    { text: "Within you there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
    { text: "Lord, grant me the serenity to accept the things I cannot change, the courage to change the things I can, and the wisdom to know the difference.", author: "Reinhold Niebuhr" },
    { text: "He who has God has everything; he who does not have God has nothing.", author: "St. Augustine" },
    { text: "The privilege of a lifetime is being who you are.", author: "Joseph Campbell" },
  ],
  "Reach Out": [
    { text: "No man is an island, entire of itself.", author: "John Donne" },
    { text: "The greatest gift you can give someone is your time, because you're giving a portion of your life you'll never get back.", author: "Unknown" },
    { text: "We rise by lifting others.", author: "Robert Ingersoll" },
    { text: "A single conversation across the table with a wise man is worth a month's study of books.", author: "Chinese Proverb" },
    { text: "Iron sharpens iron, and one man sharpens another.", author: "Proverbs 27:17" },
    { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Gandhi" },
    { text: "As we express our gratitude, we must never forget that the highest appreciation is not to utter words, but to live by them.", author: "JFK" },
    { text: "Be who you needed when you were younger.", author: "Ayesha Siddiqi" },
    { text: "Connection is the energy that is created between people when they feel seen, heard, and valued.", author: "Brené Brown" },
    { text: "A friend is someone who gives you total freedom to be yourself.", author: "Jim Morrison" },
  ],
};

export const RITUAL_INSTRUCTIONS = {
  "Bodyweight Workout": {
    label: "FORGE THE BODY", ritualLabel: "Forge the Body", activityName: "Bodyweight Workout",
    time: "20 minutes", duration_seconds: 1200, image: "/Socrates.png",
    why: "Your body is the vessel that carries everything else — your mind, your spirit, your ambition. Training it isn't vanity. It's preparation. Every rep builds the discipline that bleeds into every other area of your life.",
    featuredQuote: { text: "It is a shame for a man to grow old without seeing the beauty and strength of which his body is capable.", author: "Socrates" },
    instructions: ["4 rounds — 45 seconds on, 15 seconds rest", "1. Pushups", "2. Squats", "3. Sit-ups", "4. Lunges", "5. Plank"],
    note: "Scale reps to your fitness level. Form over speed.",
  },
  "Walk/Jog 20min": {
    label: "EXPLORE THE LAND", ritualLabel: "Explore the Land", activityName: "Walk or Jog",
    time: "20 minutes", duration_seconds: 1200, image: "/Nietzsche.png",
    why: "Movement clears the fog. When you walk, your mind untangles problems your desk never could. The greatest thinkers in history did their best work on their feet.",
    featuredQuote: { text: "All truly great thoughts are conceived while walking.", author: "Friedrich Nietzsche" },
    instructions: ["Get outside. Walk or jog — your pace.", "No phone scrolling. Eyes up.", "If you jog, aim for steady breathing.", "If you walk, keep a brisk pace."],
    note: "Rain or shine. No excuses.",
  },
  "Read 20min": {
    label: "SHARPEN THE MIND", ritualLabel: "Sharpen the Mind", activityName: "Read for 20 Minutes",
    time: "20 minutes", duration_seconds: 1200, image: "/Descartes.png",
    why: "Every book is a conversation with someone who spent years distilling what they know into pages you can absorb in hours. Reading is the fastest way to acquire wisdom you didn't earn the hard way.",
    featuredQuote: { text: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "René Descartes" },
    instructions: ["Pick up your current book.", "No screens — physical or e-reader only.", "Set a timer and read without interruption.", "Highlight or note one idea that stands out."],
    note: "Fiction, non-fiction, philosophy — all count.",
  },
  "Pray/Meditate 10min": {
    label: "STILL THE SPIRIT", ritualLabel: "Still the Spirit", activityName: "Pray or Meditate",
    time: "10 minutes", duration_seconds: 600, image: "/John.png",
    why: "The world is loud. Stillness is where you hear what actually matters. Whether you pray or meditate, this is the ritual that connects you to something beyond the noise.",
    featuredQuote: { text: "Prayer is the raising of one's mind and heart to God.", author: "John of Damascus" },
    instructions: ["Find a quiet space. Sit upright.", "Close your eyes. Breathe deeply.", "Pray, meditate, or sit in silence.", "Let thoughts pass without chasing them."],
    note: "Stillness is strength.",
  },
  "Reach Out": {
    label: "RALLY YOUR ALLIES", ritualLabel: "Rally Your Allies", activityName: "Reach Out to Someone",
    time: "20 minutes", duration_seconds: 1200, image: "/Marcus.png",
    why: "No one builds anything great alone. The people around you are your strength multiplier. One real conversation — not a like, not a meme — can change someone's day and deepen a bond that lasts.",
    featuredQuote: { text: "We are born for cooperation.", author: "Marcus Aurelius" },
    instructions: ["Text, call, or visit someone.", "Not a meme. Not a forward.", "A genuine, personal message.", "Ask how they're doing. Mean it."],
    note: "One real connection per day changes everything.",
  },
};

// ============================================
// INTERVIEW QUESTIONS — 11 total, interleaved
// P = personality (scenario → stat points for class)
// H = habit (frequency → points for starting level)
// T = tiebreaker (pick what to improve → +1 stat)
// ============================================
export const INTERVIEW_QUESTIONS = [
  // 1. Personality — decision-making
  { id: "p1", type: "personality", text: "When faced with a tough decision, you tend to...", options: [
    { value: "head", label: "Analyze the options", desc: "Logic and data first" },
    { value: "gut", label: "Trust your instincts", desc: "Move fast, adjust later" },
    { value: "heart", label: "Follow your heart", desc: "Feelings are data too" },
    { value: "counsel", label: "Seek advice from someone you trust", desc: "Wisdom is borrowed before it's earned" },
  ]},
  // 2. Habit — exercise
  { id: "h1", type: "habit", text: "How often do you train your body — gym, sports, bodyweight, anything physical?", options: [
    { value: 0, label: "Rarely or never" },
    { value: 1, label: "Once or twice a week" },
    { value: 2, label: "3-4 times a week" },
    { value: 3, label: "5+ times a week" },
  ]},
  // 3. Personality — group role
  { id: "p2", type: "personality", text: "You're dropped into a team with strangers. What role do you naturally take?", options: [
    { value: "lead", label: "I take charge", desc: "Someone has to step up" },
    { value: "strategize", label: "I plan from the side", desc: "The brain behind the operation" },
    { value: "support", label: "I make sure everyone's good", desc: "The team is only as strong as its weakest link" },
    { value: "lone", label: "I work best on my own", desc: "Let me handle my part" },
  ]},
  // 4. Habit — reading
  { id: "h2", type: "habit", text: "How often do you read — books, articles, anything longer than a headline?", options: [
    { value: 0, label: "Almost never" },
    { value: 1, label: "A few times a month" },
    { value: 2, label: "A few times a week" },
    { value: 3, label: "Daily" },
  ]},
  // 5. Personality — motivation
  { id: "p3", type: "personality", text: "What would you sacrifice the most for?", options: [
    { value: "mastery", label: "Being the best at what I do", desc: "Excellence is non-negotiable" },
    { value: "freedom", label: "Complete independence", desc: "No one tells me how to live" },
    { value: "connection", label: "The people I care about", desc: "Relationships are everything" },
    { value: "purpose", label: "Something bigger than myself", desc: "Legacy over comfort" },
  ]},
  // 6. Habit — meditation/prayer
  { id: "h3", type: "habit", text: "Do you have any kind of stillness practice — prayer, meditation, journaling, or quiet reflection?", options: [
    { value: 0, label: "No, not really" },
    { value: 1, label: "Occasionally, when I think of it" },
    { value: 2, label: "A few times a week" },
    { value: 3, label: "Daily" },
  ]},
  // 7. Personality — conflict
  { id: "p4", type: "personality", text: "Someone disrespects you publicly. Your first instinct is to...", options: [
    { value: "confront", label: "Address it directly, right there", desc: "Disrespect answered is disrespect ended" },
    { value: "calculate", label: "Stay quiet and handle it later", desc: "Timing is everything" },
    { value: "absorb", label: "Let it go — it says more about them", desc: "Not every battle is worth fighting" },
    { value: "deflect", label: "Laugh it off and move on", desc: "Never let them see you rattled" },
  ]},
  // 8. Habit — social connection
  { id: "h4", type: "habit", text: "How often do you reach out to people in your life — not just responding, but initiating?", options: [
    { value: 0, label: "Rarely" },
    { value: 1, label: "A few times a month" },
    { value: 2, label: "Weekly" },
    { value: 3, label: "Multiple times a week" },
  ]},
  // 9. Personality — values
  { id: "p5", type: "personality", text: "You can only keep one quality for the rest of your life. You choose...", options: [
    { value: "discipline", label: "Discipline", desc: "The ability to do what needs doing" },
    { value: "adaptability", label: "Adaptability", desc: "Surviving anything life throws at you" },
    { value: "wisdom", label: "Wisdom", desc: "Seeing what others miss" },
    { value: "loyalty", label: "Loyalty", desc: "The people around you can always count on you" },
  ]},
  // 10. Habit — discipline
  { id: "h5", type: "habit", text: "Be honest — how disciplined are you on a daily basis right now?", options: [
    { value: 0, label: "I have a lot of work to do" },
    { value: 1, label: "Hit or miss, depends on the day" },
    { value: 2, label: "Pretty consistent" },
    { value: 3, label: "Very disciplined" },
  ]},
  // 11. Tiebreaker
  { id: "t1", type: "tiebreaker", text: "If you could level up one area of your life starting tomorrow, what would it be?", options: [
    { value: "str", label: "Physical strength and endurance", desc: "Train harder. Get stronger." },
    { value: "agi", label: "Speed, flexibility, and adaptability", desc: "Move faster. React quicker." },
    { value: "int", label: "Knowledge and mental sharpness", desc: "Outthink everyone in the room." },
    { value: "spi", label: "Inner peace and clarity", desc: "A calm mind sees further." },
    { value: "cha", label: "Social confidence and influence", desc: "Be the person people gravitate toward." },
  ]},
];

// ============================================
// QUEST POOL — all possible daily quests
// ============================================
export const QUEST_POOL = [
  { id: "q1", name: "Cold Shower Challenge", desc: "60 seconds of cold water", xp: 15, gold: 2, stats: ["str", "spi"] },
  { id: "q2", name: "Journal Entry", desc: "Write half a page in your journal", xp: 15, gold: 2, stats: ["int", "spi"] },
  { id: "q3", name: "Expand Your Network", desc: "Send a personalized message to someone new", xp: 15, gold: 2, stats: ["cha", "agi"] },
  { id: "q4", name: "Connect with a Mentor", desc: "Have a meaningful conversation with a mentor", xp: 15, gold: 2, stats: ["cha", "int"] },
  { id: "q5", name: "Cook a Healthy Meal", desc: "Prepare a nutritious meal from scratch", xp: 15, gold: 2, stats: ["str", "int"] },
  { id: "q6", name: "Learn Something New", desc: "Watch a tutorial or take an online lesson", xp: 15, gold: 2, stats: ["int", "agi"] },
  { id: "q7", name: "Declutter Your Space", desc: "Clean and organize one area of your room", xp: 15, gold: 2, stats: ["str", "spi"] },
  { id: "q8", name: "No Social Media", desc: "Stay off all social media for 4 hours", xp: 15, gold: 2, stats: ["spi", "int"] },
  { id: "q9", name: "Compliment Three People", desc: "Give three genuine, specific compliments today", xp: 15, gold: 2, stats: ["cha", "spi"] },
  { id: "q10", name: "Stretch for 10 Minutes", desc: "Full-body stretching routine", xp: 15, gold: 2, stats: ["str", "agi"] },
  { id: "q11", name: "Write Down 3 Goals", desc: "Write three goals for this week and how you'll achieve them", xp: 15, gold: 2, stats: ["int", "spi"] },
  { id: "q12", name: "Help Someone", desc: "Do something helpful for someone without being asked", xp: 15, gold: 2, stats: ["cha", "spi"] },
  { id: "q13", name: "Practice a Skill", desc: "Spend 20 minutes practicing a skill you're developing", xp: 15, gold: 2, stats: ["int", "agi"] },
  { id: "q14", name: "Budget Check", desc: "Review your spending and set a budget for the week", xp: 15, gold: 2, stats: ["int", "cha"] },
  { id: "q15", name: "Hydration Quest", desc: "Drink 8 glasses of water today", xp: 15, gold: 2, stats: ["str", "spi"] },
  { id: "q16", name: "Gratitude List", desc: "Write down 5 things you're grateful for", xp: 15, gold: 2, stats: ["spi", "cha"] },
];

// Get local date string (YYYY-MM-DD) in user's timezone
export function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Get Monday of the current week (local time)
export function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

// Deterministic daily quest picker — same quests for same date+userId, shuffles daily
export function getDailyQuests(dateStr, usrId = "", count = 4) {
  const seed = (dateStr + usrId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pool = [...QUEST_POOL];
  let s = seed;
  for (let i = pool.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// Get a random quote for a given ritual name
export function getRandomQuote(ritualName) {
  const quotes = RITUAL_QUOTES[ritualName];
  if (!quotes || quotes.length === 0) return { text: "Every day is a new quest.", author: "GuildUp" };
  return quotes[Math.floor(Math.random() * quotes.length)];
}