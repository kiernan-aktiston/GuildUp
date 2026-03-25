import { useState, useMemo } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, RANKS, getItem } from '../equipmentData';

// ═══════════════════════════════════════
// THE WANDERER — MERCHANT NPC
// ═══════════════════════════════════════

const MERCHANT_LINES = [
  "I've traveled far this week. See anything you like?",
  "Gold weighs less when spent wisely.",
  "These won't be here next week. Neither will I.",
  "Every warrior needs an edge. I sell edges.",
  "The road gives. The road takes. Today, I give.",
  "You remind me of someone strong. They bought the good stuff too.",
  "Choose carefully. Or don't. I get paid either way.",
  "The chests? Even I don't know what's inside. That's the fun.",
];

const CHEST_TYPES = [
  { id: "iron", name: "Iron Chest", emoji: "\u{1F7E2}", rarity: "common", price: 50, desc: "Contains 1 Common item for your level range.", color: "#22c55e" },
  { id: "runed", name: "Runed Chest", emoji: "\u{1F535}", rarity: "rare", price: 200, desc: "Contains 1 Rare item for your level range.", color: "#3b82f6" },
  { id: "shadow", name: "Shadow Chest", emoji: "\u{1F7E3}", rarity: "epic", price: 600, desc: "Contains 1 Epic item for your level range.", color: "#a855f7" },
  { id: "mystery", name: "Mystery Chest", emoji: "\u2728", rarity: null, price: 150, desc: "Contains 1 item of any rarity. Fortune favors the bold.", color: "#f59e0b" },
];

// Seeded random — deterministic per week + user
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 0) / 0x7fffffff;
  };
}

function getWeekSeed(userId = "") {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
  const seedStr = `${now.getFullYear()}-W${weekNum}-${userId}`;
  return seedStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function generateWeeklyStock(playerLevel, userId, ownedIds = []) {
  const seed = getWeekSeed(userId);
  const rng = seededRandom(seed);

  // Determine relevant ranks based on player level
  const relevantRanks = RANKS.filter(r => r.level <= playerLevel + 5);
  if (relevantRanks.length === 0) relevantRanks.push(RANKS[0]);

  // Pick items: 3 per relevant rank tier (1 common, 1 rare, 1 epic)
  // Shuffle available items per rank+rarity, pick one
  const stock = [];
  const rarityKeys = Object.keys(RARITIES);

  relevantRanks.forEach(rank => {
    rarityKeys.forEach(rarity => {
      const candidates = ITEMS.filter(i =>
        i.levelReq === rank.level &&
        i.rarity === rarity &&
        !ownedIds.includes(i.id)
      );
      if (candidates.length === 0) return;
      // Seeded shuffle and pick one
      const shuffled = [...candidates].sort(() => rng() - 0.5);
      stock.push(shuffled[0]);
    });
  });

  return stock;
}

function rollChest(chestType, playerLevel, ownedIds = []) {
  // Determine rank based on player level
  const relevantRanks = RANKS.filter(r => r.level <= playerLevel + 5);
  const rank = relevantRanks[Math.floor(Math.random() * relevantRanks.length)] || RANKS[0];

  let rarity;
  if (chestType.rarity) {
    rarity = chestType.rarity;
  } else {
    // Mystery chest: 60% common, 30% rare, 10% epic
    const roll = Math.random();
    rarity = roll < 0.6 ? "common" : roll < 0.9 ? "rare" : "epic";
  }

  // Get candidates not already owned
  let candidates = ITEMS.filter(i =>
    i.levelReq === rank.level &&
    i.rarity === rarity &&
    !ownedIds.includes(i.id)
  );

  // If all owned at this rank+rarity, try other ranks
  if (candidates.length === 0) {
    candidates = ITEMS.filter(i =>
      i.rarity === rarity &&
      !ownedIds.includes(i.id)
    );
  }

  // If still nothing, try any rarity
  if (candidates.length === 0) {
    candidates = ITEMS.filter(i => !ownedIds.includes(i.id));
  }

  if (candidates.length === 0) return null; // owns everything

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, inventoryCap = 50 }) {
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [openingChest, setOpeningChest] = useState(null); // chest being opened
  const [chestResult, setChestResult] = useState(null);   // item received
  const [justBought, setJustBought] = useState(null);

  const weeklyStock = useMemo(() =>
    generateWeeklyStock(playerLevel, userId, inventory),
    [playerLevel, userId, inventory]
  );

  const merchantLine = useMemo(() => {
    const seed = getWeekSeed(userId);
    return MERCHANT_LINES[seed % MERCHANT_LINES.length];
  }, [userId]);

  const handleBuy = (item) => {
    if (playerGold < item.price || playerLevel < item.levelReq || inventory.length >= inventoryCap) return;
    onBuy?.(item.id, item.price);
    setJustBought(item.id);
    setBuyConfirm(null);
    setInspectItem(null);
    setTimeout(() => setJustBought(null), 2000);
  };

  const handleOpenChest = (chest) => {
    if (playerGold < chest.price || inventory.length >= inventoryCap) return;
    const result = rollChest(chest, playerLevel, inventory);
    if (!result) return;
    setOpeningChest(chest);
    onBuy?.(result.id, chest.price);
    setTimeout(() => {
      setChestResult(result);
    }, 800);
  };

  const isFull = inventory.length >= inventoryCap;

  return (
    <div style={{
      minHeight: "100vh", position: "relative", animation: "fadeIn 0.3s ease",
      padding: "24px 16px 120px",
    }}>
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/store-bg.png)", backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.25, pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ═══ MERCHANT NPC ═══ */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 14,
          padding: "16px", borderRadius: 16,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          marginBottom: 20,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16, flexShrink: 0,
            background: "radial-gradient(circle, #1a1a2e 60%, #000 100%)",
            border: `2px solid ${C.gold}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <img src="/Merchant.png" alt="The Wanderer" style={{
              width: 56, height: 56, objectFit: "contain", imageRendering: "pixelated",
              filter: "brightness(1.1)",
            }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<span style="font-size:32px">\u{1F9D9}</span>'; }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>The Wanderer</div>
                <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>Traveling Merchant</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  padding: "4px 10px", borderRadius: 8,
                  background: C.surfaceLight, display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 12 }}>{"\u{1F392}"}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, fontFamily: "monospace",
                    color: inventory.length >= inventoryCap ? "#ef4444" : C.text,
                  }}>{inventory.length}/{inventoryCap}</span>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 8,
                  background: C.surfaceLight, display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 14 }}>{"\u{1FA99}"}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>{playerGold}</span>
                </div>
              </div>
            </div>
            <div style={{
              padding: "8px 12px", borderRadius: 10,
              background: C.surfaceLight, border: `1px solid ${C.border}`,
            }}>
              <p style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>"{merchantLine}"</p>
            </div>
          </div>
        </div>

        {/* ═══ THIS WEEK'S STOCK ═══ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>This Week's Stock</div>
            <div style={{ fontSize: 10, color: C.textDim }}>Refreshes Monday</div>
          </div>

          {weeklyStock.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div style={{ fontSize: 13, color: C.textMuted }}>The Wanderer has nothing left to sell you this week.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weeklyStock.map(item => {
                const rarity = RARITIES[item.rarity];
                const slot = SLOTS[item.slot];
                const canAfford = playerGold >= item.price;
                const meetsLevel = playerLevel >= item.levelReq;
                const wasBought = justBought === item.id;
                return (
                  <div key={item.id} onClick={() => { if (!wasBought) setInspectItem(item); }} style={{
                    padding: "12px 14px", borderRadius: 12, cursor: wasBought ? "default" : "pointer",
                    background: wasBought ? "rgba(34,197,94,0.1)" : C.card,
                    border: wasBought ? "1px solid rgba(34,197,94,0.3)" : `1px solid ${C.cardBorder}`,
                    borderLeft: `3px solid ${rarity.color}`,
                    opacity: wasBought ? 0.5 : 1, transition: "all 0.3s ease",
                  }}>
                    {wasBought ? (
                      <div style={{ textAlign: "center", color: "#22c55e", fontWeight: 700, fontSize: 13 }}>{"\u2713"} Purchased</div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: rarity.bgColor, border: `1px solid ${rarity.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20,
                        }}>{slot.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: rarity.color }}>{item.name}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                            {Object.entries(item.stats).map(([stat, val]) => (
                              <span key={stat} style={{
                                fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                                background: val > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                                color: val > 0 ? "#22c55e" : "#ef4444",
                              }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: canAfford ? C.gold : "#ef4444" }}>{"\u{1FA99}"} {item.price}</div>
                          {!meetsLevel && <div style={{ fontSize: 9, color: "#ef4444" }}>Lv {item.levelReq}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ SEALED CHESTS ═══ */}
        <div>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Sealed Chests</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CHEST_TYPES.map(chest => {
              const canAfford = playerGold >= chest.price;
              const canOpen = canAfford && !isFull;
              return (
                <div key={chest.id} onClick={() => { if (canOpen) handleOpenChest(chest); }} style={{
                  padding: "16px 14px", borderRadius: 14, cursor: canOpen ? "pointer" : "default",
                  background: C.card, border: `1px solid ${C.cardBorder}`,
                  opacity: canOpen ? 1 : 0.5, textAlign: "center",
                  transition: "all 0.2s ease",
                }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>{chest.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: chest.color }}>{chest.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, lineHeight: 1.4 }}>{isFull ? "Inventory full" : chest.desc}</div>
                  <div style={{
                    marginTop: 8, padding: "6px 12px", borderRadius: 8,
                    background: canOpen ? `${chest.color}22` : C.surfaceLight,
                    display: "inline-block",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: canOpen ? chest.color : C.textDim }}>{"\u{1FA99}"} {chest.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ ITEM INSPECT / BUY MODAL ═══ */}
      {inspectItem && (() => {
        const rarity = RARITIES[inspectItem.rarity];
        const slot = SLOTS[inspectItem.slot];
        const canAfford = playerGold >= inspectItem.price;
        const meetsLevel = playerLevel >= inspectItem.levelReq;
        return (
          <div onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)", display: "flex",
            alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease", padding: 24,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: "100%", maxWidth: 340, padding: 24, borderRadius: 20,
              background: C.surface, border: `1px solid ${rarity.border}`,
            }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, margin: "0 auto 12px",
                  background: rarity.bgColor, border: `2px solid ${rarity.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                }}>{slot.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{inspectItem.desc}</div>
              </div>
              <div style={{ padding: "12px", borderRadius: 10, background: C.surfaceLight, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {Object.entries(inspectItem.stats).map(([stat, val]) => (
                    <div key={stat} style={{
                      padding: "4px 10px", borderRadius: 6,
                      background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: val > 0 ? "#22c55e" : "#ef4444" }}>{val > 0 ? "+" : ""}{val}</div>
                      <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{stat}</div>
                    </div>
                  ))}
                </div>
              </div>
              {inspectItem.levelReq > 1 && (
                <div style={{ fontSize: 11, color: meetsLevel ? C.textDim : "#ef4444", textAlign: "center", marginBottom: 12 }}>
                  Requires Level {inspectItem.levelReq} {meetsLevel ? "\u2713" : `(you are ${playerLevel})`}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {buyConfirm === inspectItem.id ? (
                  <button onClick={() => handleBuy(inspectItem)} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 15, fontWeight: 700,
                    background: "#22c55e", color: "#000",
                  }}>Confirm {"\u2014"} {"\u{1FA99}"} {inspectItem.price}</button>
                ) : (
                  <button onClick={() => { if (canAfford && meetsLevel && !isFull) setBuyConfirm(inspectItem.id); }} disabled={!canAfford || !meetsLevel || isFull} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: canAfford && meetsLevel && !isFull ? "pointer" : "default",
                    fontSize: 15, fontWeight: 700,
                    background: canAfford && meetsLevel && !isFull ? `linear-gradient(135deg, ${C.gold}, ${C.goldDark})` : C.surfaceLight,
                    color: canAfford && meetsLevel && !isFull ? "#000" : C.textDim,
                    opacity: canAfford && meetsLevel && !isFull ? 1 : 0.5,
                  }}>
                    {isFull ? "Inventory full" : !canAfford ? `Need ${inspectItem.price - playerGold} more gold` : !meetsLevel ? `Requires Level ${inspectItem.levelReq}` : `Buy \u2014 \u{1FA99} ${inspectItem.price}`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{
                  width: "100%", padding: "12px", borderRadius: 12,
                  border: `1px solid ${C.border}`, cursor: "pointer",
                  background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 600,
                }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ CHEST OPENING MODAL ═══ */}
      {openingChest && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.9)", display: "flex",
          alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.3s ease", padding: 24,
        }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!chestResult ? (
              // Opening animation
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{
                  fontSize: 80, marginBottom: 16,
                  animation: "pulse 0.6s ease infinite",
                }}>{openingChest.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: openingChest.color }}>Opening {openingChest.name}...</div>
              </div>
            ) : (
              // Reveal
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontSize: 14, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>You received</div>
                <div style={{
                  width: 80, height: 80, borderRadius: 20, margin: "0 auto 16px",
                  background: RARITIES[chestResult.rarity].bgColor,
                  border: `3px solid ${RARITIES[chestResult.rarity].color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 40, boxShadow: `0 0 30px ${RARITIES[chestResult.rarity].color}44`,
                }}>{SLOTS[chestResult.slot].emoji}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: RARITIES[chestResult.rarity].color, marginBottom: 4 }}>{chestResult.name}</div>
                <div style={{ fontSize: 11, color: RARITIES[chestResult.rarity].color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                  {RARITIES[chestResult.rarity].label} {SLOTS[chestResult.slot].label}
                </div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16, lineHeight: 1.5 }}>{chestResult.desc}</div>
                <div style={{ padding: "10px", borderRadius: 10, background: C.surfaceLight, marginBottom: 20, display: "inline-flex", gap: 8 }}>
                  {Object.entries(chestResult.stats).map(([stat, val]) => (
                    <div key={stat} style={{
                      padding: "4px 8px", borderRadius: 6,
                      background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: val > 0 ? "#22c55e" : "#ef4444" }}>{val > 0 ? "+" : ""}{val}</div>
                      <div style={{ fontSize: 8, color: C.textDim, textTransform: "uppercase" }}>{stat}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <button onClick={() => { setOpeningChest(null); setChestResult(null); }} style={{
                    padding: "14px 48px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, ${RARITIES[chestResult.rarity].color}, ${RARITIES[chestResult.rarity].color}cc)`,
                    color: "#000", fontSize: 15, fontWeight: 700,
                  }}>Nice!</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}