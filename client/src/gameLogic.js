import { RITUAL_QUOTES } from './constants';

// ============================================
// LEVELING ENGINE
// ============================================

const XP_TABLE = [0, 5, 25, 75, 150, 200, 300, 350, 400, 450];

export function xpForLevel(level) {
  if (level <= 9) return XP_TABLE[level] || 5;
  return 550 + (level - 10) * 50;
}

export function totalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

export function statPointsForLevel(level) {
  if (level <= 9) return 2;
  if (level <= 24) return 3;
  if (level <= 50) return 4;
  if (level <= 75) return 5;
  return 6;
}

export function distributeStatPoints(activityTally, points) {
  const stats = ["str", "agi", "int", "spi", "cha"];
  const total = stats.reduce((sum, s) => sum + (activityTally[s] || 0), 0);

  if (total === 0) {
    const result = { str: 0, agi: 0, int: 0, spi: 0, cha: 0 };
    for (let i = 0; i < points; i++) result[stats[i % 5]] += 1;
    return result;
  }

  const raw = {};
  const floored = {};
  stats.forEach(s => {
    raw[s] = ((activityTally[s] || 0) / total) * points;
    floored[s] = Math.floor(raw[s]);
  });

  let distributed = stats.reduce((sum, s) => sum + floored[s], 0);
  const result = { ...floored };
  const remainders = stats
    .map(s => ({ stat: s, remainder: raw[s] - floored[s] }))
    .sort((a, b) => b.remainder - a.remainder);
  let remaining = points - distributed;
  for (let i = 0; i < remaining; i++) result[remainders[i].stat] += 1;

  return result;
}

export function evaluateClass(stats) {
  const statMap = {
    str: stats.str || 0, agi: stats.agi || 0, int: stats.int || 0,
    spi: stats.spi || 0, cha: stats.cha || 0,
  };

  const sorted = Object.entries(statMap).sort((a, b) => b[1] - a[1]);
  const [top1, top2] = [sorted[0], sorted[1]];
  const diff = top1[1] - top2[1];
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

export function processLevelUp(currentLevel, currentStats, activityTally) {
  const points = statPointsForLevel(currentLevel);
  const distribution = distributeStatPoints(activityTally, points);

  const newStats = {
    str: currentStats.str + distribution.str, agi: currentStats.agi + distribution.agi,
    int: currentStats.int + distribution.int, spi: currentStats.spi + distribution.spi,
    cha: currentStats.cha + distribution.cha,
  };

  const newClass = evaluateClass(newStats);
  return { newStats, newClass, pointsAwarded: points, distribution };
}

export function assignClassFromPersonality(answers) {
  const scores = { str: 0, agi: 0, int: 0, spi: 0, cha: 0 };

  if (answers.p1 === "intro") { scores.int += 2; scores.spi += 1; }
  else if (answers.p1 === "ambi") { scores.agi += 1; scores.cha += 1; scores.str += 1; }
  else if (answers.p1 === "extro") { scores.cha += 2; scores.str += 1; }

  if (answers.p2 === "morning") { scores.str += 2; scores.spi += 1; }
  else if (answers.p2 === "afternoon") { scores.agi += 2; scores.int += 1; }
  else if (answers.p2 === "night") { scores.int += 2; scores.cha += 1; }

  if (answers.p3 === "head") { scores.int += 3; }
  else if (answers.p3 === "gut") { scores.agi += 2; scores.str += 1; }
  else if (answers.p3 === "heart") { scores.spi += 2; scores.cha += 1; }
  else if (answers.p3 === "counsel") { scores.cha += 2; scores.spi += 1; }

  if (answers.p4 === "lead") { scores.str += 2; scores.cha += 1; }
  else if (answers.p4 === "strategize") { scores.int += 2; scores.agi += 1; }
  else if (answers.p4 === "support") { scores.spi += 2; scores.cha += 1; }
  else if (answers.p4 === "lone") { scores.agi += 2; scores.int += 1; }

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

export function calcStartingLevel(habitAnswers) {
  const total = Object.values(habitAnswers).reduce((sum, v) => sum + v, 0);
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

export function getRandomQuote(ritualName) {
  const quotes = RITUAL_QUOTES[ritualName] || RITUAL_QUOTES["Bodyweight Workout"];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
