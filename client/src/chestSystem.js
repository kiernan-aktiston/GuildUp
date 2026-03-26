// GuildUp — Chest System
// Shared chest rolling logic used by Store, Meditation, and Guild
import { ITEMS, RANKS } from './equipmentData';

// ═══════════════════════════════════════
// CHEST DEFINITIONS
// ═══════════════════════════════════════

export const CHEST_TYPES = {
  iron:       { id: "iron",       name: "Iron Chest",      emoji: "\u{1F7E2}", price: 50,   gold: 25,  itemChance: 0.60, rarityWeights: { common: 1.0, rare: 0, epic: 0 },        color: "#22c55e" },
  runed:      { id: "runed",      name: "Runed Chest",     emoji: "\u{1F535}", price: 200,  gold: 75,  itemChance: 0.50, rarityWeights: { common: 0, rare: 1.0, epic: 0 },        color: "#3b82f6" },
  shadow:     { id: "shadow",     name: "Shadow Chest",    emoji: "\u{1F7E3}", price: 600,  gold: 200, itemChance: 0.45, rarityWeights: { common: 0, rare: 0, epic: 1.0 },        color: "#a855f7" },
  mystery:    { id: "mystery",    name: "Mystery Chest",   emoji: "\u2728",    price: 150,  gold: 50,  itemChance: 0.55, rarityWeights: { common: 0.50, rare: 0.35, epic: 0.15 }, color: "#f59e0b" },
  meditation: { id: "meditation", name: "Meditation Chest", emoji: "\u{1F4DC}", price: 0,   gold: 30,  itemChance: 0.50, rarityWeights: { common: 0.40, rare: 0.40, epic: 0.20 }, color: "#3b82f6" },
  guild:      { id: "guild",      name: "Guild Chest",     emoji: "\u{1F451}", price: 0,   gold: 500, itemChance: 0.75, rarityWeights: { common: 0.20, rare: 0.40, epic: 0.40 }, color: "#f59e0b" },
};

// Store-purchasable chests
export const STORE_CHESTS = [
  CHEST_TYPES.iron,
  CHEST_TYPES.runed,
  CHEST_TYPES.shadow,
  CHEST_TYPES.mystery,
];

// ═══════════════════════════════════════
// CHEST ROLLING
// ═══════════════════════════════════════

// Roll a chest — returns { gold, item } where item can be null
export function rollChest(chestType, playerLevel, ownedIds = []) {
  const result = { gold: chestType.gold, item: null };

  // Roll for item
  const itemRoll = Math.random();
  if (itemRoll >= chestType.itemChance) {
    // No item — gold only
    return result;
  }

  // Determine rarity from weights
  const weights = chestType.rarityWeights;
  const rarityRoll = Math.random();
  let rarity;
  if (rarityRoll < weights.common) {
    rarity = "common";
  } else if (rarityRoll < weights.common + weights.rare) {
    rarity = "rare";
  } else {
    rarity = "epic";
  }

  // Determine rank based on player level
  const relevantRanks = RANKS.filter(r => r.level <= playerLevel + 5);
  const rank = relevantRanks[Math.floor(Math.random() * relevantRanks.length)] || RANKS[0];

  // Find candidates not already owned
  let candidates = ITEMS.filter(i =>
    i.levelReq === rank.level && i.rarity === rarity && !ownedIds.includes(i.id)
  );
  if (candidates.length === 0) {
    candidates = ITEMS.filter(i => i.rarity === rarity && !ownedIds.includes(i.id));
  }
  if (candidates.length === 0) {
    candidates = ITEMS.filter(i => !ownedIds.includes(i.id));
  }
  if (candidates.length === 0) {
    // Player owns everything — extra gold instead
    result.gold += chestType.gold;
    return result;
  }

  result.item = candidates[Math.floor(Math.random() * candidates.length)];
  return result;
}

// Format chest result description
export function getChestDescription(chestType) {
  const pct = Math.round(chestType.itemChance * 100);
  const rarities = [];
  if (chestType.rarityWeights.common > 0) rarities.push("Common");
  if (chestType.rarityWeights.rare > 0) rarities.push("Rare");
  if (chestType.rarityWeights.epic > 0) rarities.push("Epic");
  return `+${chestType.gold} gold guaranteed. ${pct}% chance for ${rarities.join("/")} item.`;
}
