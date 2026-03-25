// GuildUp — Equipment Data Model
// 375 items: 5 ranks × 3 rarities × 5 slots × 5 stats
// Generated programmatically from naming conventions
//
// Sprites: base character = /character-base.png (512x1024)
// Equipment overlays = /equipment/{slot}/{item-id}.png (512x1024, transparent)

// ═══════════════════════════════════════
// CORE TABLES
// ═══════════════════════════════════════

export const RARITIES = {
  common: { label: "Common",  title: "Traveler's", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.1)",   border: "rgba(34, 197, 94, 0.3)" },
  rare:   { label: "Rare",    title: "Captain's",  color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)",  border: "rgba(59, 130, 246, 0.3)" },
  epic:   { label: "Epic",    title: "Royalty's",   color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)",  border: "rgba(168, 85, 247, 0.3)" },
};

export const RANKS = [
  { level: 1,  name: "Novice" },
  { level: 10, name: "Apprentice" },
  { level: 20, name: "Adept" },
  { level: 25, name: "Veteran" },
  { level: 30, name: "Elite" },
];

export const SLOTS = {
  head:   { label: "Head",   emoji: "\u{1FA96}", order: 0 },
  chest:  { label: "Chest",  emoji: "\u{1F6E1}\uFE0F", order: 1 },
  gloves: { label: "Gloves", emoji: "\u{1F9E4}", order: 2 },
  pants:  { label: "Pants",  emoji: "\u{1FA73}", order: 3 },
  boots:  { label: "Boots",  emoji: "\u{1F97E}", order: 4 },
};

// Piece name varies by slot + rarity
const PIECE_NAMES = {
  head:   { common: "Hood",     rare: "Circlet",    epic: "Crown" },
  chest:  { common: "Tunic",    rare: "Breastplate", epic: "Cloak" },
  gloves: { common: "Wraps",    rare: "Gauntlets",  epic: "Vambraces" },
  pants:  { common: "Breeches", rare: "Greaves",    epic: "Legguards" },
  boots:  { common: "Sandals",  rare: "Treads",     epic: "Sabatons" },
};

// Stat → animal mapping
const STAT_ANIMALS = {
  str: { animal: "Bear",  meaning: "Raw power" },
  agi: { animal: "Tiger", meaning: "Speed and reflexes" },
  int: { animal: "Owl",   meaning: "Knowledge and wisdom" },
  spi: { animal: "Wolf",  meaning: "Instinct and inner strength" },
  cha: { animal: "Lion",  meaning: "Presence and command" },
};

// Stat bonuses by rarity
// primary = the animal stat, secondary/tertiary added for higher rarities
const STAT_TEMPLATES = {
  common: (primary) => ({ [primary]: 1 }),
  rare:   (primary) => {
    const secondaries = { str: "agi", agi: "str", int: "spi", spi: "int", cha: "spi" };
    return { [primary]: 3, [secondaries[primary]]: 1 };
  },
  epic:   (primary) => {
    const mapping = {
      str: { str: 3, agi: 1, spi: 2 },
      agi: { agi: 3, str: 1, cha: 1 },
      int: { int: 3, spi: 2, cha: 1 },
      spi: { spi: 3, int: 1, cha: 2 },
      cha: { cha: 3, spi: 1, str: 2 },
    };
    return mapping[primary];
  },
};

// Price by rarity × rank
const PRICE_TABLE = {
  common: [15, 40, 85, 115, 150],
  rare:   [150, 275, 500, 650, 850],
  epic:   [400, 650, 1100, 1400, 1800],
};

// Scale stat bonuses by rank index (higher ranks = stronger items)
const RANK_STAT_MULTIPLIERS = [1, 1.5, 2, 2.5, 3];

// ═══════════════════════════════════════
// ITEM GENERATION
// ═══════════════════════════════════════

function generateItems() {
  const items = [];
  const rarityKeys = Object.keys(RARITIES);
  const slotKeys = Object.keys(SLOTS);
  const statKeys = Object.keys(STAT_ANIMALS);

  RANKS.forEach((rank, rankIdx) => {
    rarityKeys.forEach(rarity => {
      slotKeys.forEach(slot => {
        statKeys.forEach(primaryStat => {
          const r = RARITIES[rarity];
          const piece = PIECE_NAMES[slot][rarity];
          const animal = STAT_ANIMALS[primaryStat].animal;
          const name = `${rank.name} ${r.title} ${piece} of the ${animal}`;
          const id = `${slot}-${rank.name.toLowerCase()}-${rarity}-${primaryStat}`;

          // Generate stats with rank scaling
          const baseStats = STAT_TEMPLATES[rarity](primaryStat);
          const mult = RANK_STAT_MULTIPLIERS[rankIdx];
          const stats = {};
          Object.entries(baseStats).forEach(([stat, val]) => {
            stats[stat] = Math.round(val * mult);
          });

          const price = PRICE_TABLE[rarity][rankIdx];

          // Description based on rarity + slot + stat flavor
          const descs = {
            common: {
              head: "Simple protection. Enough to start.",
              chest: "Basic covering. Keeps the wind out.",
              gloves: "Worn fabric. Better than bare hands.",
              pants: "Sturdy cloth. Nothing more.",
              boots: "Thin soles. They'll do for now.",
            },
            rare: {
              head: "Forged with purpose. Commands respect.",
              chest: "Reinforced and battle-tested. Holds under pressure.",
              gloves: "Precision-crafted. Grip like iron.",
              pants: "Layered protection. Built to endure.",
              boots: "Sure-footed. Never slip.",
            },
            epic: {
              head: "A crown for those who earned it. Radiates authority.",
              chest: "Woven with power. The air shifts when you wear it.",
              gloves: "Touch of command. Every grip is absolute.",
              pants: "Silence and strength in every stride.",
              boots: "Walk with the weight of purpose. The ground remembers.",
            },
          };

          items.push({
            id,
            slot,
            rarity,
            name,
            desc: descs[rarity][slot],
            price,
            stats,
            levelReq: rank.level,
            rankName: rank.name,
            primaryStat,
            animal,
          });
        });
      });
    });
  });

  return items;
}

export const ITEMS = generateItems();

// ═══════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════

export function getItem(id) {
  return ITEMS.find(i => i.id === id) || null;
}

export function getItemsBySlot(slot) {
  return ITEMS.filter(i => i.slot === slot);
}

export function getStoreItems(ownedIds = []) {
  return ITEMS.filter(i => !ownedIds.includes(i.id));
}

export function calcEquipmentBonuses(equippedIds = {}) {
  const bonuses = { str: 0, agi: 0, int: 0, spi: 0, cha: 0 };
  Object.values(equippedIds).forEach(itemId => {
    if (!itemId) return;
    const item = getItem(itemId);
    if (!item) return;
    Object.entries(item.stats).forEach(([stat, val]) => {
      bonuses[stat] = (bonuses[stat] || 0) + val;
    });
  });
  return bonuses;
}

export function getSpritePath(itemId) {
  const item = getItem(itemId);
  if (!item) return null;
  return `/equipment/${item.slot}/${item.id}.png`;
}

export const EMPTY_EQUIPMENT = {
  head: null,
  chest: null,
  gloves: null,
  pants: null,
  boots: null,
};