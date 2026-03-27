// src/supabase.js — GuildUp Supabase Client
// Drop this into your Replit project at src/supabase.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://emdodkszhwulhcjebdqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_455p_jeew6nNULW_hD_ABA_UOCEfQDm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTH
// ============================================

export async function signUp(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

// ============================================
// PROFILE
// ============================================

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// QUESTS
// ============================================

export async function getQuestDefinitions() {
  const { data, error } = await supabase
    .from('quest_definitions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function getTodayProgress(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('quest_progress')
    .select('*, quest_definitions(*)')
    .eq('user_id', userId)
    .eq('quest_date', today);
  if (error) throw error;
  return data;
}

export async function completeQuest(userId, questId) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('quest_progress')
    .insert({ user_id: userId, quest_id: questId, quest_date: today })
    .select('*, quest_definitions(*)')
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// DAILY RITUALS
// ============================================

export async function getTodayRituals(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_rituals')
    .select('*')
    .eq('user_id', userId)
    .eq('ritual_date', today)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertRituals(userId, rituals) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_rituals')
    .upsert({
      user_id: userId,
      ritual_date: today,
      ...rituals,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,ritual_date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// ACTIVITY TALLY + LEVEL UP
// ============================================

export async function incrementTally(userId, statCategory) {
  const profile = await getProfile(userId);
  const tallyField = `tally_${statCategory}`;
  const update = { [tallyField]: (profile[tallyField] || 0) + 1 };
  return updateProfile(userId, update);
}

export async function resetTally(userId) {
  return updateProfile(userId, {
    tally_str: 0, tally_agi: 0, tally_int: 0, tally_spi: 0, tally_cha: 0,
  });
}

export async function logLevelUp(userId, data) {
  const { error } = await supabase
    .from('level_up_log')
    .insert({
      user_id: userId,
      new_level: data.newLevel,
      points_awarded: data.pointsAwarded,
      distribution: data.distribution,
      old_class: data.oldClass,
      new_class: data.newClass,
      class_changed: data.oldClass !== data.newClass,
      tally_snapshot: data.tallySnapshot,
    });
  if (error) throw error;
}

export async function awardXPAndProcess(userId, xpAmount, statCategory) {
  // 1. Increment tally
  if (statCategory) {
    await incrementTally(userId, statCategory);
  }

  // 2. Get current profile
  const profile = await getProfile(userId);
  const newXP = profile.xp + xpAmount;

  // 3. Check for level up
  const xpNeeded = totalXpForLevel(profile.level + 1);

  if (newXP >= xpNeeded) {
    // LEVEL UP
    const newLevel = profile.level + 1;
    const tally = {
      str: profile.tally_str || 0,
      agi: profile.tally_agi || 0,
      int: profile.tally_int || 0,
      spi: profile.tally_spi || 0,
      cha: profile.tally_cha || 0,
    };
    const currentStats = {
      str: profile.stat_str, agi: profile.stat_agi,
      int: profile.stat_int, spi: profile.stat_spi, cha: profile.stat_cha,
    };

    const points = statPointsForLevel(newLevel);
    const distribution = distributeStatPoints(tally, points);
    const newStats = {
      str: currentStats.str + distribution.str,
      agi: currentStats.agi + distribution.agi,
      int: currentStats.int + distribution.int,
      spi: currentStats.spi + distribution.spi,
      cha: currentStats.cha + distribution.cha,
    };
    const newClass = evaluateClass(newStats);

    // Update profile
    await updateProfile(userId, {
      xp: newXP,
      level: newLevel,
      class: newClass,
      stat_str: newStats.str, stat_agi: newStats.agi,
      stat_int: newStats.int, stat_spi: newStats.spi, stat_cha: newStats.cha,
      tally_str: 0, tally_agi: 0, tally_int: 0, tally_spi: 0, tally_cha: 0,
    });

    // Log it
    await logLevelUp(userId, {
      newLevel, pointsAwarded: points, distribution,
      oldClass: profile.class, newClass, tallySnapshot: tally,
    });

    return {
      leveledUp: true,
      newLevel, newXP, newStats, newClass,
      oldClass: profile.class,
      distribution, pointsAwarded: points,
    };
  } else {
    // No level up, just update XP
    await updateProfile(userId, { xp: newXP });
    return { leveledUp: false, newXP };
  }
}

// ============================================
// GOLD
// ============================================

export async function awardGold(userId, amount, reason, referenceId = null) {
  const profile = await getProfile(userId);
  await updateProfile(userId, { gold: profile.gold + amount });
  await supabase.from('gold_transactions').insert({
    user_id: userId, amount, reason, reference_id: referenceId,
  });
}

export async function purchaseItem(userId, itemId) {
  const { data: item } = await supabase
    .from('store_items').select('*').eq('id', itemId).single();
  const profile = await getProfile(userId);
  if (profile.gold < item.gold_cost) throw new Error('Not enough gold');

  await updateProfile(userId, { gold: profile.gold - item.gold_cost });
  const { data: inv } = await supabase
    .from('user_inventory')
    .insert({ user_id: userId, item_id: itemId, durability_remaining: item.durability })
    .select().single();
  await supabase.from('gold_transactions').insert({
    user_id: userId, amount: -item.gold_cost, reason: 'store_purchase', reference_id: itemId,
  });
  return inv;
}

// ============================================
// STORE
// ============================================

export async function getStoreItems() {
  const { data, error } = await supabase
    .from('store_items').select('*').eq('is_available', true);
  if (error) throw error;
  return data;
}

export async function getUserInventory(userId) {
  const { data, error } = await supabase
    .from('user_inventory').select('*, store_items(*)').eq('user_id', userId);
  if (error) throw error;
  return data;
}

// ============================================
// GUILDS
// ============================================

export async function getUserGuild(userId) {
  const { data, error } = await supabase
    .from('guild_members').select('*, guilds(*)').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getGuildMembers(guildId) {
  const { data, error } = await supabase
    .from('guild_members')
    .select('*, profiles(display_name, class, level)')
    .eq('guild_id', guildId);
  if (error) throw error;
  return data;
}

export async function createGuild(userId, name, description) {
  const { data: guild, error } = await supabase
    .from('guilds').insert({ name, description, leader_id: userId }).select().single();
  if (error) throw error;
  await supabase.from('guild_members').insert({ guild_id: guild.id, user_id: userId, role: 'leader' });
  return guild;
}

export async function joinGuildByCode(userId, inviteCode) {
  const { data: guild, error } = await supabase
    .from('guilds').select('*').eq('invite_code', inviteCode).single();
  if (error) throw new Error('Invalid invite code');
  await supabase.from('guild_members').insert({ guild_id: guild.id, user_id: userId, role: 'member' });
  return guild;
}

// ============================================
// STREAKS
// ============================================

export async function getStreaks(userId) {
  const { data, error } = await supabase.from('streaks').select('*').eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function updateStreak(userId, streakType) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const { data: streak } = await supabase
    .from('streaks').select('*').eq('user_id', userId).eq('streak_type', streakType).single();
  if (!streak) return;

  let newCurrent = 1;
  if (streak.last_completed_date === yesterday) {
    newCurrent = streak.current_streak + 1;
  } else if (streak.last_completed_date === today) {
    return streak;
  }

  const { data } = await supabase
    .from('streaks')
    .update({
      current_streak: newCurrent,
      longest_streak: Math.max(newCurrent, streak.longest_streak),
      last_completed_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', streak.id).select().single();
  return data;
}

// ============================================
// LEVELING HELPERS (shared with frontend)
// ============================================

export function xpForLevel(level) {
  return 100 + (level - 1) * 50;
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
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
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