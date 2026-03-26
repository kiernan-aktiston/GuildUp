import { useState, useMemo } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, RANKS, getItem } from '../equipmentData';
import { STORE_CHESTS, rollChest, getChestDescription } from '../chestSystem';

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

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s >>> 0) / 0x7fffffff; };
}

function getWeekSeed(userId = "") {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
  return `${now.getFullYear()}-W${weekNum}-${userId}`.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function generateWeeklyStock(playerLevel, userId, ownedIds = []) {
  const seed = getWeekSeed(userId);
  const rng = seededRandom(seed);
  const relevantRanks = RANKS.filter(r => r.level <= playerLevel + 5);
  if (relevantRanks.length === 0) relevantRanks.push(RANKS[0]);
  const stock = [];
  const rarityKeys = Object.keys(RARITIES);
  relevantRanks.forEach(rank => {
    rarityKeys.forEach(rarity => {
      const candidates = ITEMS.filter(i => i.levelReq === rank.level && i.rarity === rarity && !ownedIds.includes(i.id));
      if (candidates.length === 0) return;
      const shuffled = [...candidates].sort(() => rng() - 0.5);
      stock.push(shuffled[0]);
    });
  });
  return stock;
}

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, onChestReward, inventoryCap = 50 }) {
  const [filterSlot, setFilterSlot] = useState("all");
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [openingChest, setOpeningChest] = useState(null);
  const [chestResult, setChestResult] = useState(null); // { gold, item }
  const [justBought, setJustBought] = useState(null);

  const weeklyStock = useMemo(() => generateWeeklyStock(playerLevel, userId, inventory), [playerLevel, userId, inventory]);
  const merchantLine = useMemo(() => { const seed = getWeekSeed(userId); return MERCHANT_LINES[seed % MERCHANT_LINES.length]; }, [userId]);
  const isFull = inventory.length >= inventoryCap;

  const handleBuy = (item) => {
    if (playerGold < item.price || playerLevel < item.levelReq || isFull) return;
    onBuy?.(item.id, item.price);
    setJustBought(item.id);
    setBuyConfirm(null);
    setInspectItem(null);
    setTimeout(() => setJustBought(null), 2000);
  };

  const handleOpenChest = (chest) => {
    if (playerGold < chest.price) return;
    // If inventory is full, can still open for gold but not items
    const result = rollChest(chest, playerLevel, isFull ? ITEMS.map(i => i.id) : inventory);
    setOpeningChest(chest);
    // Process rewards
    onChestReward?.(chest.price, result.gold, result.item);
    setTimeout(() => setChestResult(result), 800);
  };

  const filteredStock = filterSlot === "all" ? weeklyStock : weeklyStock.filter(i => i.slot === filterSlot);

  return (
    <div style={{ minHeight: "100vh", position: "relative", animation: "fadeIn 0.3s ease", padding: "24px 16px 120px" }}>
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, height: "100vh", backgroundImage: "url(/store-bg.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.25, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Merchant NPC */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px", borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, flexShrink: 0, background: "radial-gradient(circle, #1a1a2e 60%, #000 100%)", border: `2px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src="/store-merchant.png" alt="The Wanderer" style={{ width: 56, height: 56, objectFit: "contain", imageRendering: "pixelated", filter: "brightness(1.1)" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<span style="font-size:32px">\u{1F9D9}</span>'; }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>The Wanderer</div>
                <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>Traveling Merchant</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ padding: "4px 10px", borderRadius: 8, background: C.surfaceLight, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12 }}>{"\u{1F392}"}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: isFull ? "#ef4444" : C.text }}>{inventory.length}/{inventoryCap}</span>
                </div>
                <div style={{ padding: "4px 10px", borderRadius: 8, background: C.surfaceLight, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14 }}>{"\u{1FA99}"}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>{playerGold}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 10, background: C.surfaceLight, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>"{merchantLine}"</p>
            </div>
          </div>
        </div>

        {/* This Week's Stock */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>This Week's Stock</div>
            <div style={{ fontSize: 10, color: C.textDim }}>Refreshes Monday</div>
          </div>
          {/* Slot filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
            <button onClick={() => setFilterSlot("all")} style={{ padding: "5px 12px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: filterSlot === "all" ? C.gold : C.surfaceLight, color: filterSlot === "all" ? "#000" : C.textMuted, whiteSpace: "nowrap" }}>All</button>
            {Object.entries(SLOTS).map(([key, info]) => (
              <button key={key} onClick={() => setFilterSlot(key)} style={{ padding: "5px 12px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: filterSlot === key ? C.gold : C.surfaceLight, color: filterSlot === key ? "#000" : C.textMuted, whiteSpace: "nowrap" }}>{info.emoji}</button>
            ))}
          </div>
          {filteredStock.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div style={{ fontSize: 13, color: C.textMuted }}>Nothing left in this category this week.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredStock.map(item => {
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
                        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: rarity.bgColor, border: `1px solid ${rarity.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{slot.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: rarity.color }}>{item.name}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                            {Object.entries(item.stats).map(([stat, val]) => (
                              <span key={stat} style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: val > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: val > 0 ? "#22c55e" : "#ef4444" }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
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

        {/* Sealed Chests */}
        <div>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Sealed Chests</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {STORE_CHESTS.map(chest => {
              const canAfford = playerGold >= chest.price;
              return (
                <div key={chest.id} onClick={() => { if (canAfford) handleOpenChest(chest); }} style={{
                  padding: "16px 14px", borderRadius: 14, cursor: canAfford ? "pointer" : "default",
                  background: C.card, border: `1px solid ${C.cardBorder}`,
                  opacity: canAfford ? 1 : 0.5, textAlign: "center", transition: "all 0.2s ease",
                }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>{chest.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: chest.color }}>{chest.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, lineHeight: 1.4 }}>{getChestDescription(chest)}</div>
                  <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 8, background: canAfford ? `${chest.color}22` : C.surfaceLight, display: "inline-block" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: canAfford ? chest.color : C.textDim }}>{"\u{1FA99}"} {chest.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item Inspect Modal */}
      {inspectItem && (() => {
        const rarity = RARITIES[inspectItem.rarity];
        const slot = SLOTS[inspectItem.slot];
        const canAfford = playerGold >= inspectItem.price;
        const meetsLevel = playerLevel >= inspectItem.levelReq;
        const canBuy = canAfford && meetsLevel && !isFull;
        return (
          <div onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, borderRadius: 20, background: C.surface, border: `1px solid ${rarity.border}` }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 12px", background: rarity.bgColor, border: `2px solid ${rarity.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{slot.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{inspectItem.desc}</div>
              </div>
              <div style={{ padding: "12px", borderRadius: 10, background: C.surfaceLight, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {Object.entries(inspectItem.stats).map(([stat, val]) => (
                    <div key={stat} style={{ padding: "4px 10px", borderRadius: 6, background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", textAlign: "center" }}>
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
                  <button onClick={() => handleBuy(inspectItem)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "#22c55e", color: "#000" }}>Confirm {"\u2014"} {"\u{1FA99}"} {inspectItem.price}</button>
                ) : (
                  <button onClick={() => { if (canBuy) setBuyConfirm(inspectItem.id); }} disabled={!canBuy} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: canBuy ? "pointer" : "default", fontSize: 15, fontWeight: 700,
                    background: canBuy ? `linear-gradient(135deg, ${C.gold}, ${C.goldDark})` : C.surfaceLight,
                    color: canBuy ? "#000" : C.textDim, opacity: canBuy ? 1 : 0.5,
                  }}>
                    {isFull ? "Inventory full" : !canAfford ? `Need ${inspectItem.price - playerGold} more gold` : !meetsLevel ? `Requires Level ${inspectItem.levelReq}` : `Buy \u2014 \u{1FA99} ${inspectItem.price}`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Chest Opening Modal */}
      {openingChest && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!chestResult ? (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: 80, marginBottom: 16, animation: "pulse 0.6s ease infinite" }}>{openingChest.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: openingChest.color }}>Opening {openingChest.name}...</div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                {/* Gold always shown */}
                <div style={{ fontSize: 14, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                  {chestResult.item ? "You received" : "Gold only"}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.gold, marginBottom: 8 }}>{"\u{1FA99}"} +{chestResult.gold}</div>

                {chestResult.item ? (
                  <>
                    <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>and an item...</div>
                    <div style={{
                      width: 80, height: 80, borderRadius: 20, margin: "0 auto 16px",
                      background: RARITIES[chestResult.item.rarity].bgColor,
                      border: `3px solid ${RARITIES[chestResult.item.rarity].color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 40, boxShadow: `0 0 30px ${RARITIES[chestResult.item.rarity].color}44`,
                    }}>{SLOTS[chestResult.item.slot].emoji}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: RARITIES[chestResult.item.rarity].color, marginBottom: 4 }}>{chestResult.item.name}</div>
                    <div style={{ fontSize: 11, color: RARITIES[chestResult.item.rarity].color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                      {RARITIES[chestResult.item.rarity].label} {SLOTS[chestResult.item.slot].label}
                    </div>
                    <div style={{ padding: "10px", borderRadius: 10, background: C.surfaceLight, marginBottom: 20, display: "inline-flex", gap: 8 }}>
                      {Object.entries(chestResult.item.stats).map(([stat, val]) => (
                        <div key={stat} style={{ padding: "4px 8px", borderRadius: 6, background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: val > 0 ? "#22c55e" : "#ef4444" }}>{val > 0 ? "+" : ""}{val}</div>
                          <div style={{ fontSize: 8, color: C.textDim, textTransform: "uppercase" }}>{stat}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, marginTop: 8 }}>No item this time. The odds weren't in your favor.</div>
                )}
                <div>
                  <button onClick={() => { setOpeningChest(null); setChestResult(null); }} style={{
                    padding: "14px 48px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: chestResult.item ? `linear-gradient(135deg, ${RARITIES[chestResult.item.rarity].color}, ${RARITIES[chestResult.item.rarity].color}cc)` : `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                    color: "#000", fontSize: 15, fontWeight: 700,
                  }}>{chestResult.item ? "Nice!" : "Onward"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}