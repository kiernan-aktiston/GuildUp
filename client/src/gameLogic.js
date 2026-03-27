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
      "agi+spi": "outrider", "spi+agi": "outrider",
      "str+int": "templar", "int+str": "templar",
      "agi+str": "warden", "str+agi": "warden",
      "spi+int": "oracle", "int+spi": "oracle",
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

  // P1: Decision-making
  if (answers.p1 === "head") { scores.int += 3; }
  else if (answers.p1 === "gut") { scores.agi += 2; scores.str += 1; }
  else if (answers.p1 === "heart") { scores.spi += 2; scores.cha += 1; }
  else if (answers.p1 === "counsel") { scores.cha += 2; scores.spi += 1; }

  // P2: Group role
  if (answers.p2 === "lead") { scores.str += 2; scores.cha += 1; }
  else if (answers.p2 === "strategize") { scores.int += 2; scores.agi += 1; }
  else if (answers.p2 === "support") { scores.spi += 2; scores.cha += 1; }
  else if (answers.p2 === "lone") { scores.agi += 2; scores.int += 1; }

  // P3: Motivation
  if (answers.p3 === "mastery") { scores.str += 2; scores.int += 1; }
  else if (answers.p3 === "freedom") { scores.agi += 3; }
  else if (answers.p3 === "connection") { scores.cha += 2; scores.spi += 1; }
  else if (answers.p3 === "purpose") { scores.spi += 3; }

  // P4: Conflict
  if (answers.p4 === "confront") { scores.str += 3; }
  else if (answers.p4 === "calculate") { scores.int += 2; scores.agi += 1; }
  else if (answers.p4 === "absorb") { scores.spi += 2; scores.int += 1; }
  else if (answers.p4 === "deflect") { scores.cha += 2; scores.agi += 1; }

  // P5: Values
  if (answers.p5 === "discipline") { scores.str += 2; scores.spi += 1; }
  else if (answers.p5 === "adaptability") { scores.agi += 2; scores.str += 1; }
  else if (answers.p5 === "wisdom") { scores.int += 2; scores.spi += 1; }
  else if (answers.p5 === "loyalty") { scores.cha += 2; scores.str += 1; }

  // T1: Tiebreaker — +1 to chosen stat
  if (answers.t1 && scores[answers.t1] !== undefined) {
    scores[answers.t1] += 1;
  }

  // Primary class only (hybrid unlocks at first level-up)
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const pm = { str: "warrior", agi: "ranger", int: "sage", spi: "monk", cha: "rogue" };
  return pm[sorted[0][0]] || "warrior";
}

export function calcStartingLevel(answers) {
  // Sum only habit question values (h1-h5), each 0-3, max 15
  let total = 0;
  for (const key of ["h1", "h2", "h3", "h4", "h5"]) {
    total += (answers[key] || 0);
  }
  // Cap at level 6
  if (total <= 2) return 1;
  if (total <= 4) return 2;
  if (total <= 7) return 3;
  if (total <= 10) return 4;
  if (total <= 13) return 5;
  return 6;
}

export function getRandomQuote(ritualName) {
  const quotes = RITUAL_QUOTES[ritualName] || RITUAL_QUOTES["Bodyweight Workout"];
  return quotes[Math.floor(Math.random() * quotes.length)];
}