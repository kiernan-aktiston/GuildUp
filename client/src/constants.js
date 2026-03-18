// ============================================
// DESIGN TOKENS
// ============================================
export const C = {
  bg: "#0a0e17",
  surface: "#111827",
  surfaceLight: "#1a2236",
  border: "#2a3548",
  gold: "#f0b232",
  goldDark: "#c48a1a",
  xp: "#7c5cfc",
  text: "#e5e7eb",
  textMuted: "#6b7280",
  textDim: "#4b5563",
  // Tab colors
  tabStore: "#b8860b",
  tabQuests: "#8b7d3c",
  tabBattle: "#8b3a3a",
  tabAvatar: "#6a4fb5",
  tabGuild: "#2d7a4f",
  // Ritual states
  ritualDone: "#22c55e",
  ritualPending: "#2a1a1a",
  ritualPendingBorder: "#4a2a2a",
  // Standard card
  card: "rgba(17, 24, 39, 0.6)",
  cardBorder: "rgba(42, 53, 72, 0.6)",
};

export const TABS = [
  { key: "store", label: "Store", icon: "/gold-coins.png", color: C.tabStore },
  { key: "quests", label: "Quests", icon: "/tab-quests.png", color: C.tabQuests },
  { key: "battle", label: "Arena", icon: "/tab-battle.png", color: C.tabBattle },
  { key: "avatar", label: "Avatar", icon: "/tab-avatar.png", color: C.tabAvatar },
  { key: "guild", label: "Guild", icon: "/tab-guild.png", color: C.tabGuild },
];

export const CLASSES = {
  warrior:    { emoji: "⚔️", color: "#ef4444", title: "Warrior",    desc: "Strength and discipline define you." },
  ranger:     { emoji: "🏹", color: "#22c55e", title: "Ranger",     desc: "Swift, adaptable, always moving." },
  sage:       { emoji: "📖", color: "#3b82f6", title: "Sage",       desc: "Knowledge is your greatest weapon." },
  monk:       { emoji: "🕯️", color: "#a855f7", title: "Monk",       desc: "Inner peace radiates outward." },
  rogue:      { emoji: "🗡️", color: "#f59e0b", title: "Rogue",      desc: "Charm and cunning in equal measure." },
  paladin:    { emoji: "🛡️", color: "#f97316", title: "Paladin",    desc: "Strength tempered by devotion." },
  strategist: { emoji: "🎯", color: "#ec4899", title: "Strategist", desc: "Three moves ahead, always." },
  druid:      { emoji: "🌿", color: "#14b8a6", title: "Druid",      desc: "Nature's balance flows through you." },
  spellblade: { emoji: "⚡", color: "#6366f1", title: "Spellblade", desc: "Mind and muscle forged as one." },
  alchemist:  { emoji: "⚗️", color: "#7c3aed", title: "Alchemist",  desc: "Transform the invisible into the undeniable." },
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

export const PERSONALITY_QUESTIONS = [
  { id: "p1", text: "Are you more of an...", options: [
    { value: "intro", label: "Introvert", desc: "You recharge alone" },
    { value: "ambi", label: "Ambivert", desc: "Depends on the day" },
    { value: "extro", label: "Extrovert", desc: "People energize you" },
  ]},
  { id: "p2", text: "When do you feel most alive?", options: [
    { value: "morning", label: "Morning", desc: "Early riser, clear mind" },
    { value: "afternoon", label: "Afternoon", desc: "You hit your stride midday" },
    { value: "night", label: "Night", desc: "You come alive after dark" },
  ]},
  { id: "p3", text: "When faced with a tough decision, you tend to...", options: [
    { value: "head", label: "Analyze it", desc: "Logic and data first" },
    { value: "gut", label: "Trust your gut", desc: "Instinct over analysis" },
    { value: "heart", label: "Follow your heart", desc: "Feelings matter most" },
    { value: "counsel", label: "Ask someone wise", desc: "Seek outside perspective" },
  ]},
  { id: "p4", text: "In a group, you naturally...", options: [
    { value: "lead", label: "Take charge", desc: "Someone has to lead" },
    { value: "strategize", label: "Plan from the side", desc: "The brain behind the operation" },
    { value: "support", label: "Support others", desc: "You lift people up" },
    { value: "lone", label: "Work solo", desc: "You do your best work alone" },
  ]},
  { id: "p5", text: "What drives you most?", options: [
    { value: "mastery", label: "Mastery", desc: "Being the best at what you do" },
    { value: "freedom", label: "Freedom", desc: "Living on your own terms" },
    { value: "connection", label: "Connection", desc: "Deep relationships" },
    { value: "purpose", label: "Purpose", desc: "Something bigger than yourself" },
  ]},
];

export const HABIT_QUESTIONS = [
  { id: "h1", text: "How often do you exercise?", options: [
    { value: 0, label: "Rarely or never" }, { value: 1, label: "1-2 times a week" },
    { value: 2, label: "3-4 times a week" }, { value: 3, label: "5+ times a week" },
  ]},
  { id: "h2", text: "How often do you read (books, articles, long-form)?", options: [
    { value: 0, label: "Almost never" }, { value: 1, label: "A few times a month" },
    { value: 2, label: "A few times a week" }, { value: 3, label: "Daily" },
  ]},
  { id: "h3", text: "Do you have a prayer, meditation, or mindfulness practice?", options: [
    { value: 0, label: "No" }, { value: 1, label: "Occasionally" },
    { value: 2, label: "A few times a week" }, { value: 3, label: "Daily" },
  ]},
  { id: "h4", text: "How often do you intentionally connect with friends or family?", options: [
    { value: 0, label: "Rarely" }, { value: 1, label: "A few times a month" },
    { value: 2, label: "Weekly" }, { value: 3, label: "Multiple times a week" },
  ]},
  { id: "h5", text: "How would you rate your overall daily discipline?", options: [
    { value: 0, label: "Needs a lot of work" }, { value: 1, label: "Hit or miss" },
    { value: 2, label: "Pretty consistent" }, { value: 3, label: "Very disciplined" },
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