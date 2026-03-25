// GuildUp — Equipment Data Model
// Items are defined client-side. User inventory + equipped state stored in Supabase profiles.
// Sprites: base character = /character-base.png (512x1024)
// Equipment overlays = /equipment/{slot}/{id}.png (512x1024, transparent)
// Accessory icons = /equipment/accessory/{id}.png (64x64)

export const RARITIES = {
  common:    { label: "Common",    color: "#9ca3af", bgColor: "rgba(156, 163, 175, 0.1)", border: "rgba(156, 163, 175, 0.3)" },
  uncommon:  { label: "Uncommon",  color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.1)",   border: "rgba(34, 197, 94, 0.3)" },
  rare:      { label: "Rare",      color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)",  border: "rgba(59, 130, 246, 0.3)" },
  epic:      { label: "Epic",      color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)",  border: "rgba(168, 85, 247, 0.3)" },
  legendary: { label: "Legendary", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)",  border: "rgba(245, 158, 11, 0.3)" },
};

export const SLOTS = {
  head:      { label: "Head",      emoji: "🪖", order: 0 },
  chest:     { label: "Chest",     emoji: "🛡️", order: 1 },
  offhand:   { label: "Off-Hand",  emoji: "📖", order: 2 },
  accessory: { label: "Accessory", emoji: "💍", order: 3, noSprite: true },
};

// All equipment items
// sprite: filename under /equipment/{slot}/{id}.png
// Stats: each item gives flat bonuses to one or more stats
export const ITEMS = [
  // ═══════════════════════════════════════
  // HEAD SLOT
  // ═══════════════════════════════════════
  { id: "head-leather-cap",   slot: "head", rarity: "common",    name: "Leather Cap",    desc: "Simple protection. Better than nothing.",                       price: 25,   stats: { str: 1 },                   levelReq: 1 },
  { id: "head-iron-helm",     slot: "head", rarity: "uncommon",  name: "Iron Helm",      desc: "Dull iron with a nose guard. Gets the job done.",               price: 75,   stats: { str: 2, agi: -1 },          levelReq: 5 },
  { id: "head-mage-hood",     slot: "head", rarity: "rare",      name: "Mage's Hood",    desc: "Deep blue cloth humming with faint energy.",                    price: 200,  stats: { int: 3, spi: 1 },           levelReq: 10 },
  { id: "head-shadow-crown",  slot: "head", rarity: "epic",      name: "Shadow Crown",   desc: "Obsidian circlet. Whispers at the edge of hearing.",            price: 500,  stats: { int: 3, cha: 2, spi: 1 },  levelReq: 15 },
  { id: "head-dragon-crest",  slot: "head", rarity: "legendary", name: "Dragon Crest",   desc: "Horned helm of a dragon knight. Fear precedes the wearer.",     price: 1200, stats: { str: 4, cha: 3, agi: 1 },  levelReq: 20 },

  // ═══════════════════════════════════════
  // CHEST SLOT
  // ═══════════════════════════════════════
  { id: "chest-padded-vest",   slot: "chest", rarity: "common",    name: "Padded Vest",    desc: "Quilted cloth. Absorbs minor blows.",                          price: 30,   stats: { str: 1 },                   levelReq: 1 },
  { id: "chest-chainmail",     slot: "chest", rarity: "uncommon",  name: "Chainmail",      desc: "Interlocking rings of steel. Heavy but reliable.",             price: 100,  stats: { str: 2, agi: -1 },          levelReq: 5 },
  { id: "chest-plate-armor",   slot: "chest", rarity: "rare",      name: "Plate Armor",    desc: "Segmented steel. Battle-worn but unbroken.",                   price: 250,  stats: { str: 4, agi: -2 },          levelReq: 10 },
  { id: "chest-shadow-cloak",  slot: "chest", rarity: "epic",      name: "Shadow Cloak",   desc: "Flows like liquid darkness. Purple lining catches no light.",   price: 600,  stats: { agi: 3, spi: 2, cha: 1 },  levelReq: 15 },
  { id: "chest-dragonscale",   slot: "chest", rarity: "legendary", name: "Dragonscale",    desc: "Iridescent scales of a fallen wyrm. Nearly indestructible.",   price: 1500, stats: { str: 5, spi: 2, cha: 1 },  levelReq: 20 },

  // ═══════════════════════════════════════
  // OFF-HAND SLOT
  // ═══════════════════════════════════════
  { id: "off-wooden-buckler",  slot: "offhand", rarity: "common",    name: "Wooden Buckler", desc: "Light and splintering. Blocks one hit, maybe.",                price: 20,   stats: { str: 1 },                   levelReq: 1 },
  { id: "off-iron-shield",     slot: "offhand", rarity: "uncommon",  name: "Iron Shield",    desc: "Kite shield with iron boss. Solid defense.",                  price: 80,   stats: { str: 2 },                   levelReq: 5 },
  { id: "off-crystal-orb",     slot: "offhand", rarity: "rare",      name: "Crystal Orb",    desc: "Translucent sphere pulsing with inner light.",                price: 225,  stats: { int: 3, spi: 1 },           levelReq: 10 },
  { id: "off-dark-tome",       slot: "offhand", rarity: "epic",      name: "Dark Tome",      desc: "Leather-bound. The runes glow when no one is watching.",      price: 550,  stats: { int: 4, spi: 2 },           levelReq: 15 },
  { id: "off-aegis",           slot: "offhand", rarity: "legendary", name: "Aegis",           desc: "Golden shield of a forgotten order. Radiates quiet power.",   price: 1300, stats: { str: 3, spi: 3, cha: 2 },  levelReq: 20 },

  // ═══════════════════════════════════════
  // ACCESSORY SLOT (no sprite overlay — icon only)
  // ═══════════════════════════════════════
  { id: "acc-copper-ring",     slot: "accessory", rarity: "common",    name: "Copper Ring",     desc: "Tarnished but functional. A starting point.",                price: 15,   stats: { cha: 1 },                   levelReq: 1 },
  { id: "acc-silver-amulet",   slot: "accessory", rarity: "uncommon",  name: "Silver Amulet",   desc: "Cool to the touch. Steadies the mind.",                     price: 60,   stats: { spi: 2 },                   levelReq: 5 },
  { id: "acc-sapphire-ring",   slot: "accessory", rarity: "rare",      name: "Sapphire Ring",   desc: "Deep blue stone set in white gold. Sharpens thought.",       price: 200,  stats: { int: 2, spi: 1 },           levelReq: 10 },
  { id: "acc-shadow-pendant",  slot: "accessory", rarity: "epic",      name: "Shadow Pendant",  desc: "Black gem on obsidian chain. Moves between worlds.",        price: 500,  stats: { agi: 2, cha: 2, spi: 1 },  levelReq: 15 },
  { id: "acc-heart-of-fire",   slot: "accessory", rarity: "legendary", name: "Heart of Fire",   desc: "Pulsing ember trapped in crystal. Burns without heat.",      price: 1000, stats: { str: 2, agi: 2, int: 2, spi: 1, cha: 1 }, levelReq: 20 },
];

// Helper: get item by ID
export function getItem(id) {
  return ITEMS.find(i => i.id === id) || null;
}

// Helper: get items by slot
export function getItemsBySlot(slot) {
  return ITEMS.filter(i => i.slot === slot);
}

// Helper: get items available for purchase (not already owned)
export function getStoreItems(ownedIds = [], playerLevel = 1) {
  return ITEMS.filter(i => !ownedIds.includes(i.id));
}

// Helper: calculate total stat bonuses from equipped items
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

// Helper: get sprite path for an item (returns null for accessories)
export function getSpritePath(itemId) {
  const item = getItem(itemId);
  if (!item || SLOTS[item.slot]?.noSprite) return null;
  return `/equipment/${item.slot}/${item.id}.png`;
}

// Default empty equipment
export const EMPTY_EQUIPMENT = {
  head: null,
  chest: null,
  offhand: null,
  accessory: null,
};
