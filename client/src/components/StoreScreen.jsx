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
  relevantRanks.forEach(rank => {
    Object.keys(RARITIES).forEach(rarity => {
      const candidates = ITEMS.filter(i => i.levelReq === rank.level && i.rarity === rarity && !ownedIds.includes(i.id));
      if (candidates.length === 0) return;
      stock.push([...candidates].sort(() => rng() - 0.5)[0]);
    });
  });
  return stock;
}

const SectionHeader = ({ children, color = C.gold }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color, whiteSpace: "nowrap" }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: `${color}22` }} />
  </div>
);

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, onChestReward, inventoryCap = 50 }) {
  const [filterSlot, setFilterSlot] = useState("all");
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [openingChest, setOpeningChest] = useState(null);
  const [chestResult, setChestResult] = useState(null);
  const [justBought, setJustBought] = useState(null);
  const [merchantImgError, setMerchantImgError] = useState(false);

  const weeklyStock = useMemo(() => generateWeeklyStock(playerLevel, userId, inventory), [playerLevel, userId, inventory]);
  const merchantLine = useMemo(() => MERCHANT_LINES[getWeekSeed(userId) % MERCHANT_LINES.length], [userId]);
  const isFull = inventory.length >= inventoryCap;
  const filteredStock = filterSlot === "all" ? weeklyStock : weeklyStock.filter(i => i.slot === filterSlot);

  const handleBuy = (item) => {
    if (playerGold < item.price || playerLevel < item.levelReq || isFull) return;
    onBuy?.(item.id, item.price);
    setJustBought(item.id); setBuyConfirm(null); setInspectItem(null);
    setTimeout(() => setJustBought(null), 2000);
  };
  const handleOpenChest = (chest) => {
    if (playerGold < chest.price) return;
    const result = rollChest(chest, playerLevel, isFull ? ITEMS.map(i => i.id) : inventory);
    setOpeningChest(chest);
    onChestReward?.(chest.price, result.gold, result.item);
    setTimeout(() => setChestResult(result), 800);
  };

  return (
    <div style={{ padding: "16px 18px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease", position: "relative" }}>
      {/* Subtle warm glow background */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 40% at 50% 15%, rgba(201, 168, 76, 0.05) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Merchant NPC */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {merchantImgError ? (
              <span style={{ fontSize: 28 }}>{"\u{1F9D9}"}</span>
            ) : (
              <img src="/store-merchant.png" alt="The Wanderer" style={{ width: 48, height: 48, objectFit: "contain", imageRendering: "pixelated" }} onError={() => setMerchantImgError(true)} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>The Wanderer</div>
                <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>Traveling Merchant</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: isFull ? "#ef4444" : C.textDim }}>{"\u{1F392}"} {inventory.length}/{inventoryCap}</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: C.gold }}>{"\u{1FA99}"} {playerGold}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic", lineHeight: 1.5 }}>"{merchantLine}"</div>
          </div>
        </div>

        {/* This Week's Stock */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader color={C.gold}>This Week's Stock</SectionHeader>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
            {[["all", "All"], ...Object.entries(SLOTS).map(([k, v]) => [k, v.emoji])].map(([key, label]) => (
              <button key={key} onClick={() => setFilterSlot(key)} style={{
                padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                background: filterSlot === key ? C.gold : C.surface,
                color: filterSlot === key ? "#000" : C.textMuted,
              }}>{label}</button>
            ))}
          </div>
          {filteredStock.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: C.textMuted, fontSize: 13 }}>Nothing left in this category.</div>
          ) : (
            <div>
              {filteredStock.map((item, i) => {
                const rarity = RARITIES[item.rarity];
                const slot = SLOTS[item.slot];
                const canAfford = playerGold >= item.price;
                const wasBought = justBought === item.id;
                return (
                  <div key={item.id} onClick={() => { if (!wasBought) setInspectItem(item); }} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 4px",
                    borderBottom: i < filteredStock.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: wasBought ? "default" : "pointer", opacity: wasBought ? 0.4 : 1,
                  }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{slot.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: rarity.color }}>{item.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                        {Object.entries(item.stats).map(([stat, val]) => (
                          <span key={stat} style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: val > 0 ? C.greenFaint : "rgba(239,68,68,0.12)", color: val > 0 ? C.green : "#ef4444" }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: canAfford ? C.gold : C.textDim, flexShrink: 0 }}>{"\u{1FA99}"} {item.price}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sealed Chests */}
        <div>
          <SectionHeader color={C.purple}>Sealed Chests</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {STORE_CHESTS.map(chest => {
              const canAfford = playerGold >= chest.price;
              return (
                <div key={chest.id} onClick={() => { if (canAfford) handleOpenChest(chest); }} style={{
                  padding: "16px 14px", borderRadius: 12, cursor: canAfford ? "pointer" : "default",
                  background: C.surface, border: `1px solid ${C.border}`,
                  opacity: canAfford ? 1 : 0.4, textAlign: "center",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{chest.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: chest.color }}>{chest.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, lineHeight: 1.4 }}>{getChestDescription(chest)}</div>
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: canAfford ? C.gold : C.textDim }}>{"\u{1FA99}"} {chest.price}</div>
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
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{slot.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{inspectItem.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                {Object.entries(inspectItem.stats).map(([stat, val]) => (
                  <div key={stat} style={{ padding: "4px 10px", borderRadius: 6, background: val > 0 ? C.greenFaint : "rgba(239,68,68,0.12)", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: val > 0 ? C.green : "#ef4444" }}>{val > 0 ? "+" : ""}{val}</div>
                    <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{stat}</div>
                  </div>
                ))}
              </div>
              {inspectItem.levelReq > 1 && (
                <div style={{ fontSize: 11, color: meetsLevel ? C.textDim : C.red, textAlign: "center", marginBottom: 12 }}>
                  Requires Level {inspectItem.levelReq} {meetsLevel ? "\u2713" : `(you are ${playerLevel})`}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {buyConfirm === inspectItem.id ? (
                  <button onClick={() => handleBuy(inspectItem)} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: C.green, color: "#fff" }}>Confirm {"\u2014"} {"\u{1FA99}"} {inspectItem.price}</button>
                ) : (
                  <button onClick={() => { if (canBuy) setBuyConfirm(inspectItem.id); }} disabled={!canBuy} style={{
                    width: "100%", padding: "14px", borderRadius: 20, border: "none",
                    cursor: canBuy ? "pointer" : "default", fontSize: 15, fontWeight: 600,
                    background: canBuy ? C.gold : C.surfaceLight, color: canBuy ? "#000" : C.textDim, opacity: canBuy ? 1 : 0.5,
                  }}>
                    {isFull ? "Inventory full" : !canAfford ? `Need ${inspectItem.price - playerGold} more gold` : !meetsLevel ? `Requires Level ${inspectItem.levelReq}` : `Buy \u2014 \u{1FA99} ${inspectItem.price}`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ width: "100%", padding: "12px", borderRadius: 20, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 500 }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Chest Opening Modal */}
      {openingChest && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!chestResult ? (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: 80, marginBottom: 16, animation: "pulse 0.6s ease infinite" }}>{openingChest.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: openingChest.color }}>Opening {openingChest.name}...</div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontSize: 14, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{chestResult.item ? "You received" : "Gold only"}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.gold, marginBottom: 8 }}>{"\u{1FA99}"} +{chestResult.gold}</div>
                {chestResult.item ? (
                  <>
                    <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>and an item...</div>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{SLOTS[chestResult.item.slot].emoji}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: RARITIES[chestResult.item.rarity].color, marginBottom: 4 }}>{chestResult.item.name}</div>
                    <div style={{ fontSize: 11, color: RARITIES[chestResult.item.rarity].color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>{RARITIES[chestResult.item.rarity].label} {SLOTS[chestResult.item.slot].label}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, marginTop: 8 }}>No item this time. The odds weren't in your favor.</div>
                )}
                <button onClick={() => { setOpeningChest(null); setChestResult(null); }} style={{
                  padding: "14px 48px", borderRadius: 20, border: "none", cursor: "pointer",
                  background: chestResult.item ? RARITIES[chestResult.item.rarity].color : C.gold,
                  color: "#000", fontSize: 15, fontWeight: 600,
                }}>{chestResult.item ? "Nice!" : "Onward"}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}