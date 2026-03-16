import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ============================================
// DESIGN TOKENS
// ============================================
const C = {
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
  // Tab colors from wireframe
  tabStore: "#3366ff",
  tabQuests: "#e8d44d",
  tabBattle: "#8b1a1a",
  tabAvatar: "#7c3aed",
  tabGuild: "#22c55e",
  // Ritual states
  ritualDone: "#22c55e",
  ritualPending: "#2a1a1a",
  ritualPendingBorder: "#4a2a2a",
};

const TABS = [
  { key: "store", label: "Store", icon: "🔮", color: C.tabStore },
  { key: "quests", label: "Quests", icon: "⁉️", color: C.tabQuests },
  { key: "battle", label: "Battle", icon: "⚔️", color: C.tabBattle },
  { key: "avatar", label: "Avatar", icon: "👤", color: C.tabAvatar },
  { key: "guild", label: "Guild", icon: "🛡️", color: C.tabGuild },
];

const CLASSES = {
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

const RANK_TITLES = {
  1: "Novice", 5: "Initiate", 10: "Apprentice", 15: "Journeyman", 20: "Adept",
  25: "Veteran", 30: "Elite", 35: "Champion", 40: "Legend", 50: "Myth",
};

function getRank(level) {
  const milestones = [50, 40, 35, 30, 25, 20, 15, 10, 5, 1];
  for (const m of milestones) {
    if (level >= m && RANK_TITLES[m]) return RANK_TITLES[m];
  }
  return "Novice";
}

// ============================================
// LEVELING ENGINE
// ============================================

// XP required to reach next level (custom curve from game bible)
const XP_TABLE = [0, 5, 25, 75, 150, 200, 300, 350, 400, 450];
function xpForLevel(level) {
  if (level <= 9) return XP_TABLE[level] || 5;
  // Level 10+: 550 base + 50 per level above 10
  return 550 + (level - 10) * 50;
}

// Total XP from level 1 to reach a given level
function totalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

// Stat points awarded on level up (progressive)
function statPointsForLevel(level) {
  if (level <= 9) return 2;
  if (level <= 24) return 3;
  if (level <= 50) return 4;
  if (level <= 75) return 5;
  return 6;
}

// Weighted proportional distribution of stat points
// activityTally: { str: 12, agi: 8, int: 5, spi: 3, cha: 2 }
// points: number of stat points to distribute
// Returns: { str: 2, agi: 1, int: 1, spi: 0, cha: 0 }
function distributeStatPoints(activityTally, points) {
  const stats = ["str", "agi", "int", "spi", "cha"];
  const total = stats.reduce((sum, s) => sum + (activityTally[s] || 0), 0);

  // Edge case: no activity tracked — distribute evenly to top stats
  if (total === 0) {
    const result = { str: 0, agi: 0, int: 0, spi: 0, cha: 0 };
    for (let i = 0; i < points; i++) {
      result[stats[i % 5]] += 1;
    }
    return result;
  }

  // Calculate raw proportional allocation
  const raw = {};
  const floored = {};
  stats.forEach(s => {
    raw[s] = ((activityTally[s] || 0) / total) * points;
    floored[s] = Math.floor(raw[s]);
  });

  // Distribute floored points first
  let distributed = stats.reduce((sum, s) => sum + floored[s], 0);
  const result = { ...floored };

  // Remaining points go to categories with highest remainders
  const remainders = stats
    .map(s => ({ stat: s, remainder: raw[s] - floored[s] }))
    .sort((a, b) => b.remainder - a.remainder);

  let remaining = points - distributed;
  for (let i = 0; i < remaining; i++) {
    result[remainders[i].stat] += 1;
  }

  return result;
}

// Evaluate class based on total stat profile
function evaluateClass(stats) {
  const statMap = {
    str: stats.str || 0,
    agi: stats.agi || 0,
    int: stats.int || 0,
    spi: stats.spi || 0,
    cha: stats.cha || 0,
  };

  const sorted = Object.entries(statMap).sort((a, b) => b[1] - a[1]);
  const [top1, top2] = [sorted[0], sorted[1]];
  const diff = top1[1] - top2[1];

  // If top two stats are within 20% of each other → hybrid class
  const threshold = Math.max(top1[1] * 0.2, 3);
  if (diff <= threshold) {
    const hybridMap = {
      "str+spi": "paladin", "spi+str": "paladin",
      "cha+int": "strategist", "int+cha": "strategist",
      "agi+spi": "druid", "spi+agi": "druid",
      "str+int": "spellblade", "int+str": "spellblade",
      "agi+str": "warden", "str+agi": "warden",
      "spi+int": "alchemist", "int+spi": "alchemist",
      "agi+cha": "rogue", "cha+agi": "rogue",
      "str+cha": "warrior", "cha+str": "warrior",
    };
    const key = `${top1[0]}+${top2[0]}`;
    if (hybridMap[key]) return hybridMap[key];
  }

  const primaryMap = { str: "warrior", agi: "ranger", int: "sage", spi: "monk", cha: "rogue" };
  return primaryMap[top1[0]] || "warrior";
}

// Process a level up: distribute points, check class evolution
// Returns { newStats, newClass, pointsAwarded, distribution }
function processLevelUp(currentLevel, currentStats, activityTally) {
  const points = statPointsForLevel(currentLevel);
  const distribution = distributeStatPoints(activityTally, points);

  const newStats = {
    str: currentStats.str + distribution.str,
    agi: currentStats.agi + distribution.agi,
    int: currentStats.int + distribution.int,
    spi: currentStats.spi + distribution.spi,
    cha: currentStats.cha + distribution.cha,
  };

  const newClass = evaluateClass(newStats);

  return { newStats, newClass, pointsAwarded: points, distribution };
}

// Map ritual/quest to stat category
const ACTIVITY_STAT_MAP = {
  "Bodyweight Workout": "str",
  "Walk/Jog 20min": "agi",
  "Read 20min": "int",
  "Pray/Meditate 10min": "spi",
  "Reach Out": "cha",
};

// ============================================
// TAB BAR
// ============================================
function TabBar({ active, onSwitch }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, display: "flex", zIndex: 100,
      borderTop: `1px solid ${C.border}`, background: "#1a1a2e",
    }}>
      {TABS.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onSwitch(t.key)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: isActive ? t.color : "#1a1a2e",
            border: "none", cursor: "pointer",
            padding: "10px 0 env(safe-area-inset-bottom, 10px)",
            transition: "all 0.25s ease",
          }}>
            <span style={{ fontSize: 18, filter: isActive ? "none" : "grayscale(50%)" }}>{t.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: 0.5,
              color: isActive ? "#fff" : "#ffffff88",
              textTransform: "uppercase",
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// XP BAR (appears above tabs on most screens)
// ============================================
function XPBar({ xp = 340, maxXp = 500, level = 4 }) {
  const pct = (xp / maxXp) * 100;
  return (
    <div style={{
      position: "fixed", bottom: 58, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, padding: "0 16px 8px",
      background: `linear-gradient(transparent, ${C.bg})`,
      zIndex: 99,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: C.textMuted }}>Level {level}</span>
        <span style={{ fontSize: 10, color: C.textMuted }}>{xp}/{maxXp} XP</span>
      </div>
      <div style={{ height: 6, background: C.surfaceLight, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 3,
          background: `linear-gradient(90deg, ${C.xp}, #a78bfa)`,
        }} />
      </div>
    </div>
  );
}

// ============================================
// QUESTS SCREEN
// ============================================
function QuestsScreen({ onOpenRitual, completedRituals = {}, completedQuests = [], onCompleteQuest, playerClass = "warrior", playerLevel = 1 }) {
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const rituals = [
    { name: "Bodyweight Workout", label: "Forge the Body", emoji: "⚔️" },
    { name: "Walk/Jog 20min", label: "Explore the Land", emoji: "🏹" },
    { name: "Read 20min", label: "Sharpen the Mind", emoji: "📖" },
    { name: "Pray/Meditate 10min", label: "Still the Spirit", emoji: "🕯️" },
    { name: "Reach Out", label: "Rally Your Allies", emoji: "🗡️" },
  ].map(r => ({ ...r, done: !!completedRituals[r.name] }));

  const quests = [
    { id: "q1", name: "Cold Shower Challenge", desc: "60 seconds of cold water", xp: 15, gold: 2, stats: ["str", "spi"] },
    { id: "q2", name: "Journal Entry", desc: "Write half a page in your journal", xp: 15, gold: 2, stats: ["int", "spi"] },
    { id: "q3", name: "Expand your Network", desc: "Send a personalized message to someone you want in your network", xp: 15, gold: 2, stats: ["cha", "agi"] },
    { id: "q4", name: "Connect with a Mentor", desc: "Have a meaningful conversation with a potential mentor", xp: 15, gold: 2, stats: ["cha", "int"] },
  ];

  // Weekly quests — auto-tracked based on rituals completed this week
  const workoutsDone = completedRituals["Bodyweight Workout"] ? 1 : 0;
  const readsDone = completedRituals["Read 20min"] ? 1 : 0;
  const reachOutsDone = completedRituals["Reach Out"] ? 1 : 0;

  const weeklyQuests = [
    { name: "Forge the Body", desc: "Forge the Body 4x this week", xp: 50, gold: 10, progress: workoutsDone, target: 4 },
    { name: "Sharpen the Mind", desc: "Sharpen the Mind 5x this week", xp: 50, gold: 10, progress: readsDone, target: 5 },
    { name: "Rally Your Allies", desc: "Rally Your Allies 5x this week", xp: 50, gold: 10, progress: reachOutsDone, target: 5 },
  ];

  return (
    <div style={{ padding: "16px 16px 120px", animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 28 }}>{cls.emoji}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Cinzel', serif" }}>Level {playerLevel} {cls.title}</div>
          <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, letterSpacing: 1 }}>RANK: {rank.toUpperCase()}</div>
        </div>
      </div>

      {/* The Five — Daily Rituals */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 1.5,
          textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
        }}>
          The Five — Daily Rituals
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rituals.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 10,
              background: r.done
                ? `linear-gradient(90deg, ${C.ritualDone}18, ${C.ritualDone}08)`
                : `linear-gradient(90deg, #3a1a1a22, #2a1a1a11)`,
              border: `1px solid ${r.done ? C.ritualDone + "33" : "#4a2a2a44"}`,
              transition: "all 0.3s ease",
            }}>
              {/* Checkbox on far left */}
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${r.done ? C.ritualDone : C.gold}`,
                background: r.done ? C.ritualDone : `${C.gold}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
              }}>
                {r.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              {/* Icon */}
              <span style={{ fontSize: 18 }}>{r.emoji}</span>
              {/* Label */}
              <span style={{
                flex: 1, fontSize: 14, fontWeight: 500,
                color: r.done ? C.textMuted : C.text,
                textDecoration: r.done ? "line-through" : "none",
              }}>{r.label}</span>
              {/* Start button on far right (or green check when done) */}
              {!r.done ? (
                <button onClick={() => onOpenRitual(r)} style={{
                  padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
                  color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                  boxShadow: `0 2px 8px ${C.ritualDone}44`,
                  flexShrink: 0,
                }}>
                  Start
                </button>
              ) : (
                <span style={{ color: C.ritualDone, fontSize: 18, flexShrink: 0 }}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Quests */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 1.5,
          textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
        }}>
          Daily Quests
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {quests.map((q) => {
            const done = completedQuests.includes(q.id);
            return (
              <div key={q.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                background: done
                  ? `linear-gradient(90deg, ${C.ritualDone}18, ${C.ritualDone}08)`
                  : C.surface,
                border: `1px solid ${done ? C.ritualDone + "33" : C.border}`,
                transition: "all 0.3s ease",
              }}>
                {/* Checkbox on far left */}
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${done ? C.ritualDone : C.gold}`,
                  background: done ? C.ritualDone : `${C.gold}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                }}>
                  {done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                </div>
                {/* Quest info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: done ? C.textMuted : C.text,
                    textDecoration: done ? "line-through" : "none",
                  }}>{q.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{q.desc}</div>
                </div>
                {/* Conquered button on far right (or green check when done) */}
                {!done ? (
                  <button onClick={() => onCompleteQuest && onCompleteQuest(q.id, q.xp, q.gold, q.stats)} style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, #3b82f6, #2563eb)`,
                    color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    boxShadow: `0 2px 8px #3b82f644`,
                    flexShrink: 0,
                  }}>
                    Conquered
                  </button>
                ) : (
                  <span style={{ color: C.ritualDone, fontSize: 18, flexShrink: 0 }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Quests */}
      <div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 1.5,
          textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
        }}>
          Weekly Quests
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {weeklyQuests.map((q, i) => {
            const done = q.progress >= q.target;
            const inProgress = q.progress > 0 && !done;
            const statusLabel = done ? "Conquered" : inProgress ? "In Progress" : "Not Started";
            const statusColor = done ? C.ritualDone : inProgress ? C.xp : C.textDim;
            return (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: 10,
                background: done ? `${C.ritualDone}11` : C.surface,
                border: `1px solid ${done ? C.ritualDone + "33" : C.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: done ? C.ritualDone : C.text,
                      }}>{q.name}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: statusColor,
                        padding: "2px 8px", borderRadius: 6,
                        background: `${statusColor}18`,
                        letterSpacing: 0.3,
                      }}>{statusLabel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{q.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 60 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.xp }}>+{q.xp} XP</div>
                    <div style={{ fontSize: 11, color: C.gold }}>+{q.gold} 🪙</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min((q.progress / q.target) * 100, 100)}%`, height: "100%", borderRadius: 2,
                    background: done ? C.ritualDone : C.xp,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                  {q.progress} / {q.target} this week
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// RITUAL QUOTES (10 per ritual, randomly selected)
// ============================================
const RITUAL_QUOTES = {
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

const RITUAL_INSTRUCTIONS = {
  "Bodyweight Workout": {
    label: "FORGE THE BODY",
    ritualLabel: "Forge the Body",
    activityName: "Bodyweight Workout",
    time: "20 minutes",
    duration_seconds: 1200,
    image: "/Socrates.png",
    why: "Your body is the vessel that carries everything else — your mind, your spirit, your ambition. Training it isn't vanity. It's preparation. Every rep builds the discipline that bleeds into every other area of your life.",
    featuredQuote: { text: "It is a shame for a man to grow old without seeing the beauty and strength of which his body is capable.", author: "Socrates" },
    instructions: [
      "4 rounds — 45 seconds on, 15 seconds rest",
      "1. Pushups",
      "2. Squats",
      "3. Sit-ups",
      "4. Lunges",
      "5. Plank",
    ],
    note: "Scale reps to your fitness level. Form over speed.",
  },
  "Walk/Jog 20min": {
    label: "EXPLORE THE LAND",
    ritualLabel: "Explore the Land",
    activityName: "Walk or Jog",
    time: "20 minutes",
    duration_seconds: 1200,
    image: "/Nietzsche.png",
    why: "Movement clears the fog. When you walk, your mind untangles problems your desk never could. The greatest thinkers in history did their best work on their feet.",
    featuredQuote: { text: "All truly great thoughts are conceived while walking.", author: "Friedrich Nietzsche" },
    instructions: [
      "Get outside. Walk or jog — your pace.",
      "No phone scrolling. Eyes up.",
      "If you jog, aim for steady breathing.",
      "If you walk, keep a brisk pace.",
    ],
    note: "Rain or shine. No excuses.",
  },
  "Read 20min": {
    label: "SHARPEN THE MIND",
    ritualLabel: "Sharpen the Mind",
    activityName: "Read for 20 Minutes",
    time: "20 minutes",
    duration_seconds: 1200,
    image: "/Descartes.png",
    why: "Every book is a conversation with someone who spent years distilling what they know into pages you can absorb in hours. Reading is the fastest way to acquire wisdom you didn't earn the hard way.",
    featuredQuote: { text: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "René Descartes" },
    instructions: [
      "Pick up your current book.",
      "No screens — physical or e-reader only.",
      "Set a timer and read without interruption.",
      "Highlight or note one idea that stands out.",
    ],
    note: "Fiction, non-fiction, philosophy — all count.",
  },
  "Pray/Meditate 10min": {
    label: "STILL THE SPIRIT",
    ritualLabel: "Still the Spirit",
    activityName: "Pray or Meditate",
    time: "10 minutes",
    duration_seconds: 600,
    image: "/John.png",
    why: "The world is loud. Stillness is where you hear what actually matters. Whether you pray or meditate, this is the ritual that connects you to something beyond the noise.",
    featuredQuote: { text: "Prayer is the raising of one's mind and heart to God.", author: "John of Damascus" },
    instructions: [
      "Find a quiet space. Sit upright.",
      "Close your eyes. Breathe deeply.",
      "Pray, meditate, or sit in silence.",
      "Let thoughts pass without chasing them.",
    ],
    note: "Stillness is strength.",
  },
  "Reach Out": {
    label: "RALLY YOUR ALLIES",
    ritualLabel: "Rally Your Allies",
    activityName: "Reach Out to Someone",
    time: "20 minutes",
    duration_seconds: 1200,
    image: "/Marcus.png",
    why: "No one builds anything great alone. The people around you are your strength multiplier. One real conversation — not a like, not a meme — can change someone's day and deepen a bond that lasts.",
    featuredQuote: { text: "We are born for cooperation.", author: "Marcus Aurelius" },
    instructions: [
      "Text, call, or visit someone.",
      "Not a meme. Not a forward.",
      "A genuine, personal message.",
      "Ask how they're doing. Mean it.",
    ],
    note: "One real connection per day changes everything.",
  },
};

function getRandomQuote(ritualName) {
  const quotes = RITUAL_QUOTES[ritualName] || RITUAL_QUOTES["Bodyweight Workout"];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// ============================================
// RITUAL DETAIL SCREEN (with countdown timer)
// ============================================
function RitualDetailScreen({ ritual, onBack }) {
  const name = ritual?.name || "Bodyweight Workout";
  const info = RITUAL_INSTRUCTIONS[name] || RITUAL_INSTRUCTIONS["Bodyweight Workout"];
  const [phase, setPhase] = useState("prep"); // "prep" → "timer"
  const [showWhy, setShowWhy] = useState(false);
  const [quote] = useState(() => getRandomQuote(name));
  const [timeLeft, setTimeLeft] = useState(info.duration_seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const pct = ((info.duration_seconds - timeLeft) / info.duration_seconds) * 100;

  // ===== WHY THIS MATTERS POPUP =====
  const WhyPopup = () => (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", display: "flex",
      alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease", padding: 24,
    }} onClick={() => setShowWhy(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 360, padding: 28, borderRadius: 20,
        background: C.surface, border: `1px solid ${C.border}`,
        boxShadow: `0 0 60px ${C.gold}11`,
      }}>
        <div style={{
          fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", marginBottom: 16, textAlign: "center",
        }}>Why This Matters</div>
        <p style={{
          fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 24,
        }}>{info.why}</p>
        <button onClick={() => setShowWhy(false)} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 15, fontWeight: 700,
        }}>
          Got It
        </button>
      </div>
    </div>
  );

  // ===== PREP SCREEN =====
  if (phase === "prep") {
    return (
      <div style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse at 50% 30%, ${C.gold}08 0%, transparent 50%),
          linear-gradient(180deg, #0a0e17 0%, #1a1028 50%, #0a0e17 100%)
        `,
        display: "flex", flexDirection: "column",
        padding: "32px 24px 40px", animation: "fadeIn 0.4s ease",
      }}>
        {showWhy && <WhyPopup />}

        {/* TOP: Ritual label + activity name */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 3,
            textTransform: "uppercase", marginBottom: 8,
          }}>{info.label}</div>
          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: 24, color: C.text,
            marginBottom: 4, lineHeight: 1.3,
          }}>{info.activityName}</h2>
          <div style={{ fontSize: 13, color: C.textMuted }}>{info.time}</div>
        </div>

        {/* Quote */}
        <div style={{
          padding: "14px 18px", borderRadius: 12, marginBottom: 20,
          background: `${C.surface}88`, border: `1px solid ${C.border}`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 14, color: C.text, fontStyle: "italic", lineHeight: 1.7, marginBottom: 6 }}>
            "{info.featuredQuote.text}"
          </div>
          <div style={{ fontSize: 12, color: C.textDim }}>— {info.featuredQuote.author}</div>
        </div>

        {/* Pixel art image */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <img
            src={info.image}
            alt={info.featuredQuote.author}
            style={{
              width: 180, height: 180, objectFit: "contain",
              imageRendering: "pixelated",
              filter: `drop-shadow(0 0 20px ${C.gold}33)`,
              mixBlendMode: "lighten",
            }}
          />
        </div>

        {/* What to Do */}
        <div style={{
          padding: "18px 20px", borderRadius: 14, marginBottom: 24,
          background: `${C.surface}cc`, border: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 12,
          }}>WHAT TO DO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {info.instructions.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0,
                  background: C.ritualDone,
                }} />
                <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
          {info.note && (
            <div style={{
              marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`,
              fontSize: 13, color: C.textMuted, fontStyle: "italic",
            }}>
              {info.note}
            </div>
          )}
        </div>

        {/* Three buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
          <button onClick={() => setPhase("timer")} style={{
            padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
            color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 0.5,
            boxShadow: `0 4px 20px ${C.ritualDone}44`,
          }}>
            I Am Ready to Begin
          </button>
          <button onClick={() => setShowWhy(true)} style={{
            padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            color: "#000", fontSize: 15, fontWeight: 600,
          }}>
            Why This Matters
          </button>
          <button onClick={() => onBack(false)} style={{
            padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, #9f1239, #881337)`,
            color: "#fda4af", fontSize: 15, fontWeight: 600,
          }}>
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  // ===== TIMER SCREEN =====
  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(ellipse at 50% 80%, #1a0a0a 0%, transparent 50%),
        linear-gradient(180deg, #0a0e17 0%, #1a1028 50%, #0a0e17 100%)
      `,
      display: "flex", flexDirection: "column",
      padding: "32px 24px 120px", position: "relative", animation: "fadeIn 0.4s ease",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${running ? C.ritualDone : C.xp}12 0%, transparent 70%)`,
        filter: "blur(40px)", pointerEvents: "none",
        transition: "background 0.5s",
      }} />

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 3,
          textTransform: "uppercase", marginBottom: 6,
        }}>{info.label}</div>
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 24, color: C.text,
          marginBottom: 4, lineHeight: 1.3,
        }}>{info.ritualLabel}</h2>
        <div style={{ fontSize: 13, color: C.textMuted }}>{info.time}</div>
      </div>

      {/* Countdown Timer */}
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          fontSize: 60, fontWeight: 700, fontFamily: "monospace",
          color: finished ? C.ritualDone : timeLeft <= 60 && running ? "#ef4444" : C.text,
          letterSpacing: 6,
          textShadow: running ? `0 0 40px ${C.xp}33` : "none",
          transition: "color 0.5s",
        }}>
          {finished ? "✓" : display}
        </div>
        {finished && (
          <div style={{ fontSize: 16, color: C.ritualDone, fontWeight: 600, marginTop: 8 }}>
            Ritual Complete!
          </div>
        )}
        {!finished && (
          <div style={{
            width: 200, height: 4, background: C.surfaceLight, borderRadius: 2,
            marginTop: 16, overflow: "hidden",
          }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, ${C.xp}, ${C.ritualDone})`,
              transition: "width 1s linear",
            }} />
          </div>
        )}
      </div>

      {/* Bottom: Quote + Buttons */}
      <div style={{ marginTop: "auto" }}>
        <div style={{
          padding: "16px 20px", borderRadius: 12, marginBottom: 16,
          background: `${C.surface}88`, border: `1px solid ${C.border}`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 14, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 6 }}>
            "{quote.text}"
          </div>
          <div style={{ fontSize: 12, color: C.textDim }}>— {quote.author}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {finished ? (
            <button onClick={() => onBack(true)} style={{
              padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
              color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
              boxShadow: `0 4px 20px ${C.ritualDone}44`,
            }}>
              Claim +10 XP
            </button>
          ) : (
            <>
              <button onClick={() => setRunning(!running)} style={{
                padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                background: running
                  ? `linear-gradient(135deg, #ca8a04, #a16207)`
                  : `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
                color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
                boxShadow: running ? `0 4px 20px #ca8a0444` : `0 4px 20px ${C.ritualDone}44`,
                transition: "all 0.3s",
              }}>
                {running ? "Pause" : timeLeft < info.duration_seconds ? "Resume" : "Start Timer"}
              </button>
              <button onClick={() => onBack(false)} style={{
                padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, #9f1239, #881337)`,
                color: "#fda4af", fontSize: 15, fontWeight: 600,
              }}>
                Quit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// AVATAR / PROFILE SCREEN
// ============================================
function AvatarScreen({ playerClass = "warrior", playerLevel = 1, playerStats = {}, playerGold = 0, playerName = "Adventurer", onSignOut, avatarUrl, onAvatarUpload }) {
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const maxStat = Math.max(playerStats.str || 10, playerStats.agi || 10, playerStats.int || 10, playerStats.spi || 10, playerStats.cha || 10, 1);
  const stats = [
    { label: "Strength", value: playerStats.str || 10, pct: ((playerStats.str || 10) / maxStat) * 100, color: "#ef4444" },
    { label: "Agility", value: playerStats.agi || 10, pct: ((playerStats.agi || 10) / maxStat) * 100, color: "#22c55e" },
    { label: "Intelligence", value: playerStats.int || 10, pct: ((playerStats.int || 10) / maxStat) * 100, color: "#3b82f6" },
    { label: "Spirit", value: playerStats.spi || 10, pct: ((playerStats.spi || 10) / maxStat) * 100, color: "#a855f7" },
    { label: "Charisma", value: playerStats.cha || 10, pct: ((playerStats.cha || 10) / maxStat) * 100, color: "#f59e0b" },
  ];

  return (
    <div style={{
      padding: "24px 16px 120px",
      background: `radial-gradient(ellipse at 50% 15%, ${cls.color}10 0%, transparent 50%)`,
      minHeight: "100vh", animation: "fadeIn 0.3s ease",
    }}>
      {/* Profile Photo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <div style={{
          width: 130, height: 130, borderRadius: 20, overflow: "hidden",
          border: `3px solid ${cls.color}88`,
          background: `linear-gradient(135deg, ${C.surfaceLight}, ${C.surface})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 32px ${cls.color}22`,
          marginBottom: 12, position: "relative",
          cursor: "pointer",
        }}
        onClick={() => document.getElementById("avatar-upload")?.click()}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: 100, height: 100, borderRadius: 50,
              border: `2px dashed ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 13, color: C.textDim, textAlign: "center", lineHeight: 1.3 }}>Tap to<br/>Upload</span>
            </div>
          )}
          {/* Class icon overlay */}
          <div style={{
            position: "absolute", bottom: -4, right: -4,
            width: 36, height: 36, borderRadius: 10,
            background: cls.color, display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${C.bg}`,
            boxShadow: `0 2px 8px #00000044`,
          }}>
            <span style={{ fontSize: 18 }}>{cls.emoji}</span>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          id="avatar-upload" type="file" accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onAvatarUpload) onAvatarUpload(file);
            e.target.value = "";
          }}
        />

        {/* Upload button */}
        <button onClick={() => document.getElementById("avatar-upload")?.click()} style={{
          padding: "6px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: C.surfaceLight, color: C.textMuted, fontSize: 12,
          cursor: "pointer", marginBottom: 12,
        }}>
          📷 {avatarUrl ? "Change Photo" : "Upload Photo"}
        </button>

        {/* Name & Class */}
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          {playerName}
        </div>
        <div style={{ fontSize: 14, color: cls.color, fontWeight: 600, marginBottom: 2 }}>
          {cls.title}
        </div>
        <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, letterSpacing: 1 }}>
          {rank.toUpperCase()} — LEVEL {playerLevel}
        </div>
      </div>

      {/* Stat Points Info */}
      <div style={{
        padding: "12px 16px", borderRadius: 10, marginBottom: 20, textAlign: "center",
        background: `${C.surface}`, border: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 12, color: C.textMuted }}>Next level up: </span>
        <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>+{statPointsForLevel(playerLevel + 1)} stat points</span>
      </div>

      {/* Character Traits (with numeric values) */}
      <div style={{
        padding: "16px", borderRadius: 12,
        background: C.surface, border: `1px solid ${C.border}`,
      }}>
        <div style={{
          fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 1.5,
          textTransform: "uppercase", marginBottom: 14, fontFamily: "'Cinzel', serif",
        }}>Character Traits</div>
        {stats.map((s, i) => (
          <div key={i} style={{ marginBottom: i < 4 ? 10 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{s.label}</span>
              <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.value}</span>
            </div>
            <div style={{ height: 6, background: C.surfaceLight, borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${s.pct}%`, height: "100%", borderRadius: 3,
                background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`,
                transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      {onSignOut && (
        <button onClick={onSignOut} style={{
          width: "100%", marginTop: 24, padding: "14px", borderRadius: 12,
          background: "transparent", border: `1px solid #7f1d1d`,
          color: "#fca5a5", fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>
          Sign Out
        </button>
      )}
    </div>
  );
}

// ============================================
// BATTLE SCREEN (Coming Soon)
// ============================================
function BattleScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 32px 120px",
      background: `radial-gradient(ellipse at 50% 40%, ${C.tabBattle}12 0%, transparent 50%)`,
      animation: "fadeIn 0.3s ease",
    }}>
      {/* Pixel art style battle preview */}
      <div style={{
        width: 280, height: 200, borderRadius: 16, marginBottom: 32,
        background: C.surface, border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Battle scene */}
        <div style={{
          position: "absolute", bottom: 0, width: "100%", height: "40%",
          background: `linear-gradient(180deg, transparent, ${C.ritualDone}08)`,
        }} />
        {/* Left fighter */}
        <div style={{
          position: "absolute", left: 40, bottom: 50,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{
            fontSize: 48,
            filter: "drop-shadow(0 0 8px #ef444444)",
            animation: "float 2s ease-in-out infinite",
          }}>⚔️</div>
          <div style={{
            fontSize: 9, color: C.text, background: `${C.tabBattle}aa`, padding: "2px 6px",
            borderRadius: 4, marginTop: 4, fontWeight: 600,
          }}>LV.8 WARRIOR</div>
        </div>
        {/* VS */}
        <div style={{
          fontSize: 20, fontWeight: 900, color: C.gold, fontFamily: "'Cinzel', serif",
          textShadow: `0 0 20px ${C.gold}44`, letterSpacing: 2,
        }}>VS</div>
        {/* Right fighter */}
        <div style={{
          position: "absolute", right: 40, bottom: 50,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{
            fontSize: 48,
            filter: "drop-shadow(0 0 8px #3b82f644)",
            animation: "float 2s ease-in-out infinite 0.5s",
          }}>📖</div>
          <div style={{
            fontSize: 9, color: C.text, background: `${C.tabStore}aa`, padding: "2px 6px",
            borderRadius: 4, marginTop: 4, fontWeight: 600,
          }}>LV.9 SAGE</div>
        </div>
      </div>

      <div style={{
        fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 3,
        textTransform: "uppercase", marginBottom: 8,
      }}>ARENA</div>

      <h2 style={{
        fontFamily: "'Cinzel', serif", fontSize: 28, color: C.text,
        textAlign: "center", marginBottom: 12,
      }}>Coming Soon</h2>

      <p style={{
        color: C.textMuted, fontSize: 14, textAlign: "center", lineHeight: 1.6,
        maxWidth: 280,
      }}>
        Challenge your friends to async 1v1 battles. Complete daily quests to strengthen your avatar and gain the edge.
      </p>

      <div style={{
        marginTop: 32, padding: "12px 24px", borderRadius: 10,
        background: `${C.tabBattle}22`, border: `1px solid ${C.tabBattle}44`,
        fontSize: 13, color: "#fca5a5",
      }}>
        Currently in Development
      </div>
    </div>
  );
}

// ============================================
// STORE SCREEN (placeholder)
// ============================================
function StoreScreen({ playerGold = 247 }) {
  const items = [
    { name: "XP Boost Potion", icon: "🧪", cost: 250, desc: "2x XP for 24hrs" },
    { name: "Gold Magnet", icon: "🧲", cost: 200, desc: "1.5x gold for 24hrs" },
    { name: "Phoenix Feather", icon: "🔥", cost: 375, desc: "Reset a broken streak" },
    { name: "Warrior's Crest", icon: "⚔️", cost: 500, desc: "Cosmetic badge" },
    { name: "Scholar's Tome", icon: "📖", cost: 500, desc: "Cosmetic badge" },
    { name: "Guild Banner", icon: "🏴", cost: 1000, desc: "Custom guild colors" },
  ];
  return (
    <div style={{ padding: "20px 16px 120px", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>Shop</div>
        <span style={{ color: C.gold, fontWeight: 600, fontSize: 15 }}>🪙 {playerGold}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: 16, borderRadius: 12, textAlign: "center",
            background: C.surface, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 2 }}>{item.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>{item.desc}</div>
            <button style={{
              width: "100%", padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              color: "#000", fontSize: 13, fontWeight: 700,
            }}>
              🪙 {item.cost}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// GUILD SCREEN (placeholder)
// ============================================
function GuildScreen({ userId, userGuild, guildMembers = [], onCreateGuild, onJoinByCode }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildDesc, setGuildDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
    background: C.surfaceLight, border: `1px solid ${C.border}`,
    color: C.text, outline: "none",
  };

  if (!userGuild && !showCreate && !showJoin) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "40px 32px 120px",
        animation: "fadeIn 0.3s ease",
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏰</div>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.tabGuild, marginBottom: 8 }}>No Guild Yet</h3>
        <p style={{ color: C.textMuted, fontSize: 14, textAlign: "center", lineHeight: 1.6, marginBottom: 32 }}>
          Join forces with others. Create a guild or enter an invite code.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
          <button onClick={() => setShowCreate(true)} style={{
            padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.tabGuild}, #16a34a)`,
            color: "#fff", fontSize: 15, fontWeight: 700, width: "100%",
          }}>Create a Guild</button>
          <button onClick={() => setShowJoin(true)} style={{
            padding: "14px 24px", borderRadius: 12, cursor: "pointer",
            background: C.surfaceLight, border: `1px solid ${C.border}`,
            color: C.text, fontSize: 15, fontWeight: 500, width: "100%",
          }}>Join with Invite Code</button>
        </div>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div style={{ padding: "40px 24px 120px", animation: "fadeIn 0.3s ease" }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.gold, marginBottom: 20 }}>Create Guild</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="text" placeholder="Guild Name" value={guildName} onChange={e => setGuildName(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Description (optional)" value={guildDesc} onChange={e => setGuildDesc(e.target.value)} style={inputStyle} />
          {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
          <button onClick={async () => {
            if (!guildName.trim()) return;
            try { await onCreateGuild(guildName, guildDesc); setShowCreate(false); }
            catch (e) { setError(e.message); }
          }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.tabGuild}, #16a34a)`,
            color: "#fff", fontSize: 15, fontWeight: 700,
          }}>Found Guild</button>
          <button onClick={() => setShowCreate(false)} style={{
            background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14,
          }}>Cancel</button>
        </div>
      </div>
    );
  }

  if (showJoin) {
    return (
      <div style={{ padding: "40px 24px 120px", animation: "fadeIn 0.3s ease" }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.gold, marginBottom: 20 }}>Join Guild</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="text" placeholder="Enter invite code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={inputStyle} />
          {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
          <button onClick={async () => {
            if (!inviteCode.trim()) return;
            try { await onJoinByCode(inviteCode); setShowJoin(false); }
            catch (e) { setError(e.message || "Invalid invite code"); }
          }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            color: "#000", fontSize: 15, fontWeight: 700,
          }}>Join</button>
          <button onClick={() => setShowJoin(false)} style={{
            background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14,
          }}>Cancel</button>
        </div>
      </div>
    );
  }

  // Show guild info
  const guild = userGuild?.guilds || {};
  return (
    <div style={{ padding: "20px 16px 120px", animation: "fadeIn 0.3s ease" }}>
      <div style={{
        padding: 20, borderRadius: 16, textAlign: "center", marginBottom: 20,
        background: C.surface, border: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏰</div>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.tabGuild }}>{guild.name || "Guild"}</h3>
        {guild.description && <p style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>{guild.description}</p>}
        <div style={{
          marginTop: 16, padding: "8px 14px", background: C.surfaceLight, borderRadius: 8, display: "inline-block",
        }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Invite Code: </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.gold, fontFamily: "monospace" }}>{guild.invite_code || "—"}</span>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, fontFamily: "'Cinzel', serif" }}>
        Members
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {guildMembers.map((m, i) => {
          const p = m.profiles || {};
          const memberClass = CLASSES[p.class] || { emoji: "⚔️", title: "Adventurer" };
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: 14,
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            }}>
              <span style={{ fontSize: 24 }}>{memberClass.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.display_name || "Member"}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Lv.{p.level || 1} {memberClass.title}</div>
              </div>
              {m.role === "leader" && <span style={{ fontSize: 11, color: C.gold }}>👑 Leader</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// AUTH SCREEN
// ============================================
function AuthScreen({ onAuth, serverError, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const displayError = error || serverError;

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
    background: C.surfaceLight, border: `1px solid ${C.border}`,
    color: C.text, outline: "none",
  };

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Email and password required"); return; }
    if (mode === "signup" && !displayName) { setError("Display name required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await onAuth({ email, password, displayName, mode });
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>⚔️</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 32, color: C.gold, letterSpacing: 2 }}>GUILDUP</h1>
        <p style={{ color: C.textMuted, marginTop: 8 }}>Forge yourself. Find your guild.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.6s ease" }}>
        {mode === "signup" && (
          <input
            type="text" placeholder="Display Name" value={displayName}
            onChange={e => setDisplayName(e.target.value)} style={inputStyle}
          />
        )}
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle}
        />
        <input
          type="password" placeholder="Password (min 6 characters)" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />

        {displayError && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{displayError}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 16, fontWeight: 700, opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
        </button>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
          style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 14, marginTop: 8, textAlign: "center" }}
        >
          {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// LANDING SCREEN
// ============================================
function LandingScreen({ onSignUp, onSignIn }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", padding: 32,
      background: `radial-gradient(ellipse at 50% 30%, ${C.gold}08 0%, transparent 60%), ${C.bg}`,
    }}>
      {/* Top branding */}
      <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
        <div style={{ fontSize: 56, marginBottom: 12, filter: `drop-shadow(0 0 20px ${C.gold}44)` }}>⚔️</div>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 36, color: C.gold,
          letterSpacing: 3, marginBottom: 6,
        }}>GUILDUP</h1>
        <p style={{
          color: C.textMuted, fontSize: 15, letterSpacing: 0.5, marginBottom: 48,
        }}>Forge yourself. Find your guild.</p>
      </div>

      {/* Buttons */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 12,
        width: "100%", maxWidth: 300, animation: "fadeIn 1s ease",
      }}>
        <button onClick={onSignUp} style={{
          width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 16, fontWeight: 700, letterSpacing: 0.5,
        }}>
          Sign Up
        </button>
        <button onClick={onSignIn} style={{
          width: "100%", padding: "16px", borderRadius: 12, cursor: "pointer",
          background: C.surfaceLight, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 16, fontWeight: 500,
        }}>
          Sign In
        </button>
      </div>
    </div>
  );
}

// ============================================
// WELCOME SLIDES
// ============================================
function WelcomeSlides({ onComplete }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { emoji: "⚔️", title: "Welcome, Adventurer", text: "GuildUp transforms your daily habits into an RPG journey. Complete quests. Level up. Become legendary." },
    { emoji: "🏋️", title: "The Five", text: "Five daily rituals form your foundation. Each one builds a different part of your character — strength, agility, intellect, spirit, and charisma." },
    { emoji: "🔄", title: "Your Class Will Evolve", text: "Your starting class is based on who you are today. But the quests you choose will shape who you become. Your class can shift as your habits change." },
    { emoji: "💪", title: "Every Quest Makes You Stronger", text: "Completing daily quests powers up your avatar. The more you do, the stronger you'll be when you battle your friends." },
    { emoji: "🏰", title: "Find Your Guild", text: "Join or create a guild with friends. Rise together, compete, and hold each other accountable." },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32 }}>
      <div key={slide} style={{ textAlign: "center", animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>{slides[slide].emoji}</div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.gold, marginBottom: 12, letterSpacing: 1 }}>
          {slides[slide].title}
        </h2>
        <p style={{ color: C.textMuted, lineHeight: 1.7, fontSize: 15, marginBottom: 40 }}>
          {slides[slide].text}
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
            background: i === slide ? C.gold : C.border, transition: "all 0.3s",
          }} />
        ))}
      </div>
      <button onClick={() => slide < slides.length - 1 ? setSlide(slide + 1) : onComplete()} style={{
        width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
        color: "#000", fontSize: 16, fontWeight: 700,
      }}>
        {slide < slides.length - 1 ? "Next" : "Begin Your Journey"}
      </button>
    </div>
  );
}

// ============================================
// INTERVIEW — PERSONALITY (determines class)
// ============================================
const PERSONALITY_QUESTIONS = [
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

// ============================================
// INTERVIEW — HABITS (determines starting level 1-9)
// ============================================
const HABIT_QUESTIONS = [
  { id: "h1", text: "How often do you exercise?", options: [
    { value: 0, label: "Rarely or never" },
    { value: 1, label: "1-2 times a week" },
    { value: 2, label: "3-4 times a week" },
    { value: 3, label: "5+ times a week" },
  ]},
  { id: "h2", text: "How often do you read (books, articles, long-form)?", options: [
    { value: 0, label: "Rarely or never" },
    { value: 1, label: "A few times a month" },
    { value: 2, label: "A few times a week" },
    { value: 3, label: "Daily" },
  ]},
  { id: "h3", text: "Do you have a prayer, meditation, or mindfulness practice?", options: [
    { value: 0, label: "No" },
    { value: 1, label: "Occasionally" },
    { value: 2, label: "A few times a week" },
    { value: 3, label: "Daily" },
  ]},
  { id: "h4", text: "How often do you intentionally connect with friends or family?", options: [
    { value: 0, label: "Rarely" },
    { value: 1, label: "A few times a month" },
    { value: 2, label: "Weekly" },
    { value: 3, label: "Multiple times a week" },
  ]},
  { id: "h5", text: "How would you rate your overall daily discipline right now?", options: [
    { value: 0, label: "Struggling — that's why I'm here" },
    { value: 1, label: "Hit or miss" },
    { value: 2, label: "Decent — room to grow" },
    { value: 3, label: "Strong — looking for the next level" },
  ]},
];

function assignClassFromPersonality(answers) {
  const scores = { str: 0, agi: 0, int: 0, spi: 0, cha: 0 };

  // p1: introvert/ambivert/extrovert
  if (answers.p1 === "intro") { scores.int += 2; scores.spi += 1; }
  else if (answers.p1 === "ambi") { scores.agi += 2; scores.cha += 1; }
  else if (answers.p1 === "extro") { scores.cha += 3; }

  // p2: morning/afternoon/night
  if (answers.p2 === "morning") { scores.spi += 2; scores.str += 1; }
  else if (answers.p2 === "afternoon") { scores.str += 2; scores.agi += 1; }
  else if (answers.p2 === "night") { scores.int += 2; scores.agi += 1; }

  // p3: decision style
  if (answers.p3 === "head") { scores.int += 3; }
  else if (answers.p3 === "gut") { scores.agi += 2; scores.str += 1; }
  else if (answers.p3 === "heart") { scores.spi += 2; scores.cha += 1; }
  else if (answers.p3 === "counsel") { scores.cha += 2; scores.spi += 1; }

  // p4: group role
  if (answers.p4 === "lead") { scores.str += 2; scores.cha += 1; }
  else if (answers.p4 === "strategize") { scores.int += 2; scores.agi += 1; }
  else if (answers.p4 === "support") { scores.spi += 2; scores.cha += 1; }
  else if (answers.p4 === "lone") { scores.agi += 2; scores.str += 1; }

  // p5: drive
  if (answers.p5 === "mastery") { scores.str += 2; scores.int += 1; }
  else if (answers.p5 === "freedom") { scores.agi += 3; }
  else if (answers.p5 === "connection") { scores.cha += 2; scores.spi += 1; }
  else if (answers.p5 === "purpose") { scores.spi += 3; }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const diff = sorted[0][1] - sorted[1][1];
  if (diff <= 2) {
    const hm = {
      "str+spi": "paladin", "spi+str": "paladin",
      "cha+int": "strategist", "int+cha": "strategist",
      "agi+spi": "druid", "spi+agi": "druid",
      "str+int": "spellblade", "int+str": "spellblade",
      "agi+str": "warden", "str+agi": "warden",
      "spi+int": "alchemist", "int+spi": "alchemist",
    };
    const k = `${sorted[0][0]}+${sorted[1][0]}`;
    if (hm[k]) return hm[k];
  }
  const pm = { str: "warrior", agi: "ranger", int: "sage", spi: "monk", cha: "rogue" };
  return pm[sorted[0][0]] || "warrior";
}

function calcStartingLevel(habitAnswers) {
  // Sum all habit scores (0-3 each, 5 questions, max 15)
  const total = Object.values(habitAnswers).reduce((sum, v) => sum + v, 0);
  // Map 0-15 → level 1-9
  if (total <= 1) return 1;
  if (total <= 3) return 2;
  if (total <= 5) return 3;
  if (total <= 7) return 4;
  if (total <= 8) return 5;
  if (total <= 10) return 6;
  if (total <= 12) return 7;
  if (total <= 13) return 8;
  return 9;
}

// ============================================
// INTERVIEW SCREEN
// ============================================
function InterviewScreen({ onComplete }) {
  const [phase, setPhase] = useState("personality"); // personality → habits
  const [qi, setQi] = useState(0);
  const [personalityAnswers, setPersonalityAnswers] = useState({});
  const [habitAnswers, setHabitAnswers] = useState({});

  const questions = phase === "personality" ? PERSONALITY_QUESTIONS : HABIT_QUESTIONS;
  const q = questions[qi];
  const answers = phase === "personality" ? personalityAnswers : habitAnswers;
  const totalQuestions = PERSONALITY_QUESTIONS.length + HABIT_QUESTIONS.length;
  const currentTotal = phase === "personality" ? qi + 1 : PERSONALITY_QUESTIONS.length + qi + 1;

  const handleAnswer = (value) => {
    if (phase === "personality") {
      const newAnswers = { ...personalityAnswers, [q.id]: value };
      setPersonalityAnswers(newAnswers);
      if (qi < PERSONALITY_QUESTIONS.length - 1) {
        setTimeout(() => setQi(qi + 1), 300);
      } else {
        // Move to habits
        setTimeout(() => { setPhase("habits"); setQi(0); }, 500);
      }
    } else {
      const newAnswers = { ...habitAnswers, [q.id]: value };
      setHabitAnswers(newAnswers);
      if (qi < HABIT_QUESTIONS.length - 1) {
        setTimeout(() => setQi(qi + 1), 300);
      } else {
        // Done — calculate class and level
        const cls = assignClassFromPersonality(personalityAnswers);
        const level = calcStartingLevel(newAnswers);
        setTimeout(() => onComplete(cls, level, personalityAnswers, newAnswers), 500);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      {/* Phase label */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{
          fontSize: 11, color: phase === "personality" ? C.tabAvatar : C.ritualDone,
          fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
        }}>
          {phase === "personality" ? "Who Are You?" : "What Are Your Habits?"}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{currentTotal} of {totalQuestions}</div>
        {/* Progress bar */}
        <div style={{ height: 4, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            width: `${(currentTotal / totalQuestions) * 100}%`, height: "100%", borderRadius: 2,
            background: `linear-gradient(90deg, ${C.tabAvatar}, ${C.ritualDone})`,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      <div key={`${phase}-${qi}`} style={{ marginTop: 32, animation: "fadeIn 0.3s ease" }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 24, textAlign: "center", lineHeight: 1.5 }}>
          {q.text}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const val = phase === "personality" ? opt.value : opt.value;
            const isSelected = answers[q.id] === val;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(val)}
                style={{
                  padding: "16px 20px", borderRadius: 12, textAlign: "left",
                  background: isSelected ? C.tabAvatar + "22" : C.surface,
                  border: `1px solid ${isSelected ? C.tabAvatar : C.border}`,
                  color: C.text, cursor: "pointer", fontSize: 15, transition: "all 0.2s",
                  opacity: 0, animation: `fadeIn 0.3s ease ${i * 0.05}s forwards`,
                }}
              >
                <div style={{ fontWeight: 500 }}>{opt.label}</div>
                {opt.desc && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{opt.desc}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// CLASS REVEAL (with starting level)
// ============================================
function ClassRevealScreen({ className, startingLevel, onContinue }) {
  const cls = CLASSES[className] || CLASSES.warrior;
  const rank = getRank(startingLevel);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", padding: 32,
      background: `radial-gradient(circle at 50% 40%, ${cls.color}15 0%, transparent 60%), ${C.bg}`,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 80, marginBottom: 16, filter: `drop-shadow(0 0 30px ${cls.color}66)`,
          animation: "fadeIn 0.6s ease",
        }}>
          {cls.emoji}
        </div>
        <div style={{
          fontSize: 13, color: C.textMuted, marginBottom: 8, letterSpacing: 3,
          textTransform: "uppercase", animation: "fadeIn 0.8s ease",
        }}>
          Your class is
        </div>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 36, color: cls.color,
          marginBottom: 8, letterSpacing: 2, animation: "fadeIn 1s ease",
        }}>
          {cls.title}
        </h1>
        <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.6, marginBottom: 16, animation: "fadeIn 1.2s ease" }}>
          {cls.desc}
        </p>

        {/* Starting level + rank */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          padding: "12px 24px", borderRadius: 12,
          background: `${C.surface}cc`, border: `1px solid ${C.border}`,
          animation: "fadeIn 1.4s ease",
        }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.gold, fontFamily: "'Cinzel', serif" }}>
              Level {startingLevel}
            </div>
            <div style={{ fontSize: 12, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {rank}
            </div>
          </div>
        </div>

        <p style={{
          color: C.textDim, fontSize: 13, marginTop: 20, lineHeight: 1.6,
          maxWidth: 280, animation: "fadeIn 1.6s ease",
        }}>
          This is where you start. Complete quests daily to level up and evolve your class.
        </p>
      </div>

      <button onClick={onContinue} style={{
        marginTop: 40, width: "100%", maxWidth: 300, padding: "16px",
        borderRadius: 12, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
        color: "#000", fontSize: 16, fontWeight: 700,
        animation: "fadeIn 1.8s ease",
      }}>
        Enter the Realm
      </button>
    </div>
  );
}

// ============================================
// LEVEL UP MODAL
// ============================================
function LevelUpModal({ level, oldClass, newClass, distribution, onClose }) {
  const cls = CLASSES[newClass] || CLASSES.warrior;
  const classChanged = oldClass !== newClass;
  const statNames = { str: "Strength", agi: "Agility", int: "Intelligence", spi: "Spirit", cha: "Charisma" };
  const statColors = { str: "#ef4444", agi: "#22c55e", int: "#3b82f6", spi: "#a855f7", cha: "#f59e0b" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", display: "flex",
      alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        width: "90%", maxWidth: 360, padding: 32, borderRadius: 20, textAlign: "center",
        background: `radial-gradient(circle at 50% 30%, ${cls.color}15 0%, ${C.surface} 60%)`,
        border: `1px solid ${cls.color}44`,
        boxShadow: `0 0 60px ${cls.color}22`,
      }}>
        <div style={{ fontSize: 56, marginBottom: 12, filter: `drop-shadow(0 0 20px ${cls.color}66)` }}>
          {cls.emoji}
        </div>
        <div style={{ fontSize: 12, color: C.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
          LEVEL UP!
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 36, fontWeight: 800, color: C.gold, marginBottom: 8 }}>
          Level {level}
        </div>

        {classChanged && (
          <div style={{
            padding: "8px 16px", borderRadius: 8, marginBottom: 16,
            background: `${cls.color}22`, border: `1px solid ${cls.color}44`,
          }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>CLASS EVOLVED</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: cls.color }}>
              {CLASSES[oldClass]?.title} → {cls.title}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1, marginBottom: 10 }}>STAT GAINS</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {Object.entries(distribution).filter(([_, v]) => v > 0).map(([stat, val]) => (
              <div key={stat} style={{
                padding: "6px 14px", borderRadius: 8,
                background: `${statColors[stat]}18`, border: `1px solid ${statColors[stat]}33`,
              }}>
                <span style={{ color: statColors[stat], fontWeight: 700, fontSize: 14 }}>+{val}</span>
                <span style={{ color: C.textMuted, fontSize: 12, marginLeft: 4 }}>{statNames[stat]}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 15, fontWeight: 700,
        }}>
          Continue
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [tab, setTab] = useState("quests");
  const [showRitualDetail, setShowRitualDetail] = useState(null);
  const [authError, setAuthError] = useState("");

  // User ID from Supabase
  const [userId, setUserId] = useState(null);

  // Player state
  const [playerName, setPlayerName] = useState("Adventurer");
  const [playerClass, setPlayerClass] = useState("warrior");
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [playerStats, setPlayerStats] = useState({ str: 10, agi: 10, int: 10, spi: 10, cha: 10 });
  const [playerGold, setPlayerGold] = useState(100);

  // Hidden activity tally (resets on level up)
  const [activityTally, setActivityTally] = useState({ str: 0, agi: 0, int: 0, spi: 0, cha: 0 });

  // Completion tracking
  const [completedRituals, setCompletedRituals] = useState({});
  const [completedQuests, setCompletedQuests] = useState([]);

  // Level up modal
  const [levelUpData, setLevelUpData] = useState(null);

  // Guild state
  const [userGuild, setUserGuild] = useState(null);
  const [guildMembers, setGuildMembers] = useState([]);

  // Avatar photo
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Auth mode for directing to signup vs signin
  const [authMode, setAuthMode] = useState("signin");

  // Prevent double-tap on quest/ritual completion
  const processingRef = useRef(new Set());

  // Load profile from Supabase into local state
  const loadProfile = async (uid) => {
    try {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("id", uid).single();
      if (error || !data) return false;
      setPlayerName(data.display_name || "Adventurer");
      setPlayerClass(data.class || "warrior");

      // Recalculate correct level from total XP (fixes stale level data)
      let correctLevel = data.level || 1;
      const storedXP = data.xp || 0;
      while (storedXP >= totalXpForLevel(correctLevel + 1)) {
        correctLevel++;
      }
      if (correctLevel !== (data.level || 1)) {
        // Level was out of sync — fix it in Supabase
        console.log(`Level corrected: ${data.level} → ${correctLevel}`);
        supabase.from("profiles").update({ level: correctLevel }).eq("id", uid);
      }
      setPlayerLevel(correctLevel);
      setPlayerXP(storedXP);
      setPlayerGold(data.gold || 100);
      setPlayerStats({
        str: data.stat_str || 10, agi: data.stat_agi || 10,
        int: data.stat_int || 10, spi: data.stat_spi || 10,
        cha: data.stat_cha || 10,
      });
      setActivityTally({
        str: data.tally_str || 0, agi: data.tally_agi || 0,
        int: data.tally_int || 0, spi: data.tally_spi || 0,
        cha: data.tally_cha || 0,
      });
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      return data.onboarding_complete;
    } catch (e) {
      console.error("Failed to load profile:", e);
      return false;
    }
  };

  // Load today's completed rituals from Supabase
  const loadTodayRituals = async (uid) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_rituals").select("*").eq("user_id", uid).eq("ritual_date", today).maybeSingle();
      if (data) {
        const completed = {};
        if (data.bodyweight_workout) completed["Bodyweight Workout"] = true;
        if (data.walk_jog) completed["Walk/Jog 20min"] = true;
        if (data.read_20) completed["Read 20min"] = true;
        if (data.pray_meditate) completed["Pray/Meditate 10min"] = true;
        if (data.reach_out) completed["Reach Out"] = true;
        setCompletedRituals(completed);
      }
    } catch (e) { console.error("Failed to load rituals:", e); }
  };

  // Load today's completed quests from Supabase
  const loadTodayQuests = async (uid) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("quest_progress").select("quest_id").eq("user_id", uid).eq("quest_date", today);
      if (data && data.length > 0) {
        setCompletedQuests(data.map(d => d.quest_id));
      }
    } catch (e) { console.error("Failed to load quests:", e); }
  };

  // Load guild
  const loadGuild = async (uid) => {
    try {
      const { data } = await supabase
        .from("guild_members").select("*, guilds(*)").eq("user_id", uid).maybeSingle();
      if (data) {
        setUserGuild(data);
        const { data: members } = await supabase
          .from("guild_members").select("*, profiles(display_name, class, level)")
          .eq("guild_id", data.guild_id);
        setGuildMembers(members || []);
      }
    } catch (e) { console.error("Failed to load guild:", e); }
  };

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const onboarded = await loadProfile(session.user.id);
        if (onboarded) {
          await loadTodayRituals(session.user.id);
          await loadTodayQuests(session.user.id);
          await loadGuild(session.user.id);
          setScreen("dashboard");
        } else {
          setScreen("interviewIntro");
        }
      } else {
        setScreen("landing");
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setScreen("landing");
        setUserId(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auth handler — real Supabase
  const handleAuth = async ({ email, password, displayName, mode }) => {
    setAuthError("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName } }
        });
        if (error) throw error;
        if (data.user) {
          setUserId(data.user.id);
          setPlayerName(displayName || email.split("@")[0]);
          setScreen("interviewIntro");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUserId(data.user.id);
          const onboarded = await loadProfile(data.user.id);
          if (onboarded) {
            await loadTodayRituals(data.user.id);
            await loadTodayQuests(data.user.id);
            await loadGuild(data.user.id);
            setScreen("dashboard");
          } else {
            setPlayerName(data.user.user_metadata?.display_name || email.split("@")[0]);
            setScreen("interviewIntro");
          }
        }
      }
    } catch (e) {
      setAuthError(e.message || "Authentication failed");
    }
  };

  // Sign out — real Supabase
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setScreen("landing");
    setUserId(null);
    setPlayerName("Adventurer");
    setPlayerClass("warrior");
    setPlayerLevel(1);
    setPlayerXP(0);
    setPlayerStats({ str: 10, agi: 10, int: 10, spi: 10, cha: 10 });
    setPlayerGold(100);
    setActivityTally({ str: 0, agi: 0, int: 0, spi: 0, cha: 0 });
    setCompletedRituals({});
    setCompletedQuests([]);
    setUserGuild(null);
    setGuildMembers([]);
    setAvatarUrl(null);
    setTab("quests");
  };

  // Save profile to Supabase
  const saveProfile = async (updates) => {
    if (!userId) return;
    try {
      await supabase.from("profiles").update({
        ...updates, updated_at: new Date().toISOString(),
      }).eq("id", userId);
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!userId || !file) return;
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      // Add cache buster
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithBust);
      saveProfile({ avatar_url: urlWithBust });
    } catch (e) {
      console.error("Failed to upload avatar:", e);
    }
  };

  const handleInterviewComplete = async (cls, level) => {
    setPlayerClass(cls);
    setPlayerLevel(level);
    const baseStats = { str: 10, agi: 10, int: 10, spi: 10, cha: 10 };
    const startBonus = (level - 1) * 2;
    const classWeights = {
      warrior: { str: 3, agi: 1, int: 0, spi: 1, cha: 0 },
      ranger: { str: 1, agi: 3, int: 1, spi: 0, cha: 0 },
      sage: { str: 0, agi: 0, int: 3, spi: 1, cha: 1 },
      monk: { str: 0, agi: 1, int: 1, spi: 3, cha: 0 },
      rogue: { str: 1, agi: 1, int: 0, spi: 0, cha: 3 },
      paladin: { str: 2, agi: 0, int: 0, spi: 2, cha: 1 },
      strategist: { str: 0, agi: 1, int: 1, spi: 0, cha: 3 },
      druid: { str: 0, agi: 2, int: 1, spi: 2, cha: 0 },
      spellblade: { str: 2, agi: 1, int: 2, spi: 0, cha: 0 },
      alchemist: { str: 0, agi: 2, int: 0, spi: 2, cha: 1 },
      warden: { str: 2, agi: 2, int: 0, spi: 1, cha: 0 },
    };
    const weights = classWeights[cls] || classWeights.warrior;
    const dist = distributeStatPoints(weights, startBonus);
    const newStats = {
      str: baseStats.str + dist.str, agi: baseStats.agi + dist.agi,
      int: baseStats.int + dist.int, spi: baseStats.spi + dist.spi,
      cha: baseStats.cha + dist.cha,
    };
    setPlayerStats(newStats);
    const startingXP = totalXpForLevel(level);
    setPlayerXP(startingXP);
    setScreen("reveal");

    // Save to Supabase
    saveProfile({
      class: cls, level, xp: startingXP, gold: 100,
      stat_str: newStats.str, stat_agi: newStats.agi,
      stat_int: newStats.int, stat_spi: newStats.spi, stat_cha: newStats.cha,
      onboarding_complete: true, display_name: playerName,
    });
  };

  const awardXP = (amount, statCategory) => {
    if (statCategory) {
      setActivityTally(prev => ({ ...prev, [statCategory]: prev[statCategory] + 1 }));
    }
    const newXP = playerXP + amount;

    // Handle multiple level-ups in a loop
    let currentLevel = playerLevel;
    let currentStats = { ...playerStats };
    let currentClass = playerClass;
    let currentTally = { ...activityTally };
    if (statCategory) currentTally[statCategory] = (currentTally[statCategory] || 0) + 1;
    let lastLevelUp = null;

    while (newXP >= totalXpForLevel(currentLevel + 1)) {
      const newLevel = currentLevel + 1;
      const oldClass = currentClass;
      const result = processLevelUp(newLevel, currentStats, currentTally);
      currentLevel = newLevel;
      currentStats = result.newStats;
      currentClass = result.newClass;
      currentTally = { str: 0, agi: 0, int: 0, spi: 0, cha: 0 };
      lastLevelUp = { level: newLevel, oldClass, newClass: result.newClass, distribution: result.distribution };
    }

    if (lastLevelUp) {
      setPlayerLevel(currentLevel);
      setPlayerStats(currentStats);
      setPlayerClass(currentClass);
      setActivityTally({ str: 0, agi: 0, int: 0, spi: 0, cha: 0 });
      setLevelUpData(lastLevelUp);

      // Persist level, stats, and class to Supabase
      if (userId) {
        saveProfile({
          level: currentLevel, class: currentClass, xp: newXP,
          stat_str: currentStats.str, stat_agi: currentStats.agi,
          stat_int: currentStats.int, stat_spi: currentStats.spi,
          stat_cha: currentStats.cha,
          tally_str: 0, tally_agi: 0, tally_int: 0, tally_spi: 0, tally_cha: 0,
        });
      }
    }
    setPlayerXP(newXP);
  };

  const handleRitualComplete = async (ritualName) => {
    if (completedRituals[ritualName]) return;
    if (processingRef.current.has(`ritual:${ritualName}`)) return;
    processingRef.current.add(`ritual:${ritualName}`);
    setCompletedRituals(prev => ({ ...prev, [ritualName]: true }));
    const stat = ACTIVITY_STAT_MAP[ritualName] || "str";
    awardXP(10, stat);
    setPlayerGold(prev => prev + 2);

    // Save ritual to Supabase
    if (userId) {
      const today = new Date().toISOString().split("T")[0];
      const ritualColumn = {
        "Bodyweight Workout": "bodyweight_workout",
        "Walk/Jog 20min": "walk_jog",
        "Read 20min": "read_20",
        "Pray/Meditate 10min": "pray_meditate",
        "Reach Out": "reach_out",
      }[ritualName];
      if (ritualColumn) {
        await supabase.from("daily_rituals").upsert({
          user_id: userId, ritual_date: today, [ritualColumn]: true,
        }, { onConflict: "user_id,ritual_date" });
      }
      // Save XP/gold/tally to profile (use computed values to avoid stale closures)
      const newXP = playerXP + 10;
      const newGold = playerGold + 2;
      const newTally = { ...activityTally, [stat]: (activityTally[stat] || 0) + 1 };
      saveProfile({
        xp: newXP, gold: newGold,
        [`tally_${stat}`]: newTally[stat],
      });
    }
  };

  // Daily quest completion
  const handleQuestComplete = async (questId, xpReward, goldReward, statCategories) => {
    if (completedQuests.includes(questId)) return;
    if (processingRef.current.has(`quest:${questId}`)) return;
    processingRef.current.add(`quest:${questId}`);
    setCompletedQuests(prev => [...prev, questId]);

    // Tally all stats for dual-stat quests
    const stats = Array.isArray(statCategories) ? statCategories : [statCategories];
    stats.forEach(stat => {
      if (stat) setActivityTally(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
    });
    awardXP(xpReward, null); // XP awarded without double-tallying
    setPlayerGold(prev => prev + goldReward);

    if (userId) {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("quest_progress").upsert({
        user_id: userId, quest_id: questId, quest_date: today,
      }, { onConflict: "user_id,quest_id,quest_date" });
      // Save XP/gold/tally using computed values
      const newXP = playerXP + xpReward;
      const newGold = playerGold + goldReward;
      const profile = { xp: newXP, gold: newGold };
      stats.forEach(stat => {
        if (stat) profile[`tally_${stat}`] = (activityTally[stat] || 0) + 1;
      });
      saveProfile(profile);
    }
  };

  // Guild handlers
  const handleCreateGuild = async (name, description) => {
    if (!userId) return;
    try {
      const { data: guild, error } = await supabase
        .from("guilds").insert({ name, description, leader_id: userId }).select().single();
      if (error) throw error;
      await supabase.from("guild_members").insert({ guild_id: guild.id, user_id: userId, role: "leader" });
      setUserGuild({ guilds: guild, guild_id: guild.id });
      setGuildMembers([{ user_id: userId, role: "leader", profiles: { display_name: playerName, class: playerClass, level: playerLevel } }]);
    } catch (e) {
      console.error("Failed to create guild:", e);
    }
  };

  const handleJoinByCode = async (code) => {
    if (!userId) return;
    try {
      const { data: guild, error } = await supabase
        .from("guilds").select("*").eq("invite_code", code).single();
      if (error) throw new Error("Invalid invite code");
      await supabase.from("guild_members").insert({ guild_id: guild.id, user_id: userId, role: "member" });
      setUserGuild({ guilds: guild, guild_id: guild.id });
      const { data: members } = await supabase
        .from("guild_members").select("*, profiles(display_name, class, level)").eq("guild_id", guild.id);
      setGuildMembers(members || []);
    } catch (e) {
      console.error("Failed to join guild:", e);
    }
  };

  const xpNeeded = xpForLevel(playerLevel);
  const rawXpInLevel = playerXP - totalXpForLevel(playerLevel);
  const xpInLevel = Math.max(0, Math.min(rawXpInLevel, xpNeeded));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; background: ${C.bg}; color: ${C.text}; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: C.bg, position: "relative" }}>
        {levelUpData && (
          <LevelUpModal
            level={levelUpData.level} oldClass={levelUpData.oldClass}
            newClass={levelUpData.newClass} distribution={levelUpData.distribution}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {screen === "loading" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: C.gold, letterSpacing: 2 }}>GUILDUP</div>
          </div>
        )}
        {screen === "landing" && (
          <LandingScreen
            onSignUp={() => { setAuthMode("signup"); setScreen("welcome"); }}
            onSignIn={() => { setAuthMode("signin"); setScreen("auth"); }}
          />
        )}
        {screen === "welcome" && <WelcomeSlides onComplete={() => setScreen("auth")} />}
        {screen === "auth" && <AuthScreen onAuth={handleAuth} serverError={authError} initialMode={authMode} />}
        {screen === "interviewIntro" && (
          <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 32,
            animation: "fadeIn 0.4s ease",
          }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🎭</div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.gold, marginBottom: 12, textAlign: "center" }}>
              Time to Discover Your Class
            </h2>
            <p style={{ color: C.textMuted, lineHeight: 1.7, fontSize: 15, textAlign: "center", marginBottom: 12 }}>
              Answer 10 quick questions. The first 5 reveal your personality and determine your class.
              The last 5 assess your current habits and set your starting level.
            </p>
            <p style={{ color: C.textDim, fontSize: 13, textAlign: "center", marginBottom: 40 }}>
              There are no wrong answers — just be honest.
            </p>
            <button onClick={() => setScreen("interview")} style={{
              width: "100%", maxWidth: 300, padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              color: "#000", fontSize: 16, fontWeight: 700,
            }}>
              Begin
            </button>
          </div>
        )}
        {screen === "interview" && <InterviewScreen onComplete={handleInterviewComplete} />}
        {screen === "reveal" && (
          <ClassRevealScreen className={playerClass} startingLevel={playerLevel} onContinue={() => setScreen("dashboard")} />
        )}
        {screen === "dashboard" && (
          <>
            {showRitualDetail ? (
              <RitualDetailScreen
                ritual={showRitualDetail}
                onBack={(didComplete) => {
                  if (didComplete) handleRitualComplete(showRitualDetail.name);
                  setShowRitualDetail(null);
                }}
              />
            ) : (
              <>
                {tab === "quests" && (
                  <QuestsScreen
                    onOpenRitual={(r) => setShowRitualDetail(r)}
                    completedRituals={completedRituals}
                    completedQuests={completedQuests}
                    onCompleteQuest={handleQuestComplete}
                    playerClass={playerClass}
                    playerLevel={playerLevel}
                  />
                )}
                {tab === "avatar" && (
                  <AvatarScreen
                    playerClass={playerClass} playerLevel={playerLevel}
                    playerStats={playerStats} playerGold={playerGold}
                    playerName={playerName} onSignOut={handleSignOut}
                    avatarUrl={avatarUrl} onAvatarUpload={handleAvatarUpload}
                  />
                )}
                {tab === "battle" && <BattleScreen />}
                {tab === "store" && <StoreScreen playerGold={playerGold} />}
                {tab === "guild" && <GuildScreen
                  userId={userId}
                  onCreateGuild={handleCreateGuild}
                  onJoinByCode={handleJoinByCode}
                  userGuild={userGuild}
                  guildMembers={guildMembers}
                />}
              </>
            )}
            {!showRitualDetail && <XPBar xp={xpInLevel} maxXp={xpNeeded} level={playerLevel} />}
            <TabBar active={tab} onSwitch={(t) => { setTab(t); setShowRitualDetail(null); }} />
          </>
        )}
      </div>
    </>
  );
}