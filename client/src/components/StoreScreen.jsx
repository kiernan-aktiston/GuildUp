import { useState, useMemo, useEffect, useRef } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, RANKS, getItem } from '../equipmentData';
import { STORE_CHESTS, rollChest } from '../chestSystem';

// ═══════════════════════════════════════
// MARKET.IO — THE ANONYMOUS TRADER
// ═══════════════════════════════════════

const TERM = "#33cc66"; // terminal green
const TERM_DIM = "#1a7a3a";
const TERM_BG = "rgba(51, 204, 102, 0.04)";

const OCTOPUS_ASCII = `
      ___
   .-'   '-.
  / \\$   \\$ \\
 |           |
  \\  \\___/  /
   '._____.'
  /  /| |\\  \\
 /  / | | \\  \\
'--'  | |  '--'
     _| |_
`;

const MARKET_QUOTES = [
  "You are worth what you can repeat.",
  "Potential doesn't trade.",
  "If it's not consistent, it's not real.",
  "You don't get paid for trying.",
  "Consistency is the only asset that compounds.",
  "Miss a day. Pay interest.",
  "Decay is automatic. Growth is not.",
  "Delay is the most expensive habit.",
  "Risk doesn't create character. It exposes it.",
  "The house isn't smarter. Just consistent.",
  "You're either compounding or leaking.",
  "Wealth goes where it's respected.",
  "Money avoids the undisciplined.",
  "You have very little leverage.",
  "You're underperforming your potential. The market noticed.",
  "You're easier to replace than you think.",
  "Right now, you're cheap.",
  "Your network is your liquidity.",
  "No one invests in the invisible.",
  "If no one knows you, you don't exist.",
  "You repeat mistakes like they're free.",
  "You've already paid for this lesson.",
  "You didn't learn it.",
  "Emotion is expensive.",
  "Everything has a price. Most people misprice themselves.",
];

// Typewriter hook
function useTypewriter(text, speed = 30, startDelay = 500) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    const delayTimer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(delayTimer);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

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
function getDaySeed(userId = "") {
  const d = new Date().toISOString().split("T")[0];
  return (d + userId).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
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

// Chest display names (no probabilities)
const CHEST_DISPLAY = [
  { ...STORE_CHESTS[0], label: "Iron Chest", hint: "Common grade" },
  { ...STORE_CHESTS[1], label: "Runed Chest", hint: "Rare grade" },
  { ...STORE_CHESTS[2], label: "Shadow Chest", hint: "Epic grade" },
  { ...STORE_CHESTS[3], label: "Mystery Chest", hint: "Unknown grade" },
];

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, onChestReward, inventoryCap = 50 }) {
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [openingChest, setOpeningChest] = useState(null);
  const [chestResult, setChestResult] = useState(null);
  const [justBought, setJustBought] = useState(null);

  const weeklyStock = useMemo(() => generateWeeklyStock(playerLevel, userId, inventory), [playerLevel, userId, inventory]);
  const isFull = inventory.length >= inventoryCap;

  // Daily quote — deterministic
  const todayQuote = useMemo(() => {
    const seed = getDaySeed(userId);
    return MARKET_QUOTES[seed % MARKET_QUOTES.length];
  }, [userId]);

  const greeting = useTypewriter(`>> ${todayQuote}`, 25, 800);

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
      {/* Subtle scanline overlay */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 0, opacity: 0.03,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(51, 204, 102, 0.1) 2px, rgba(51, 204, 102, 0.1) 4px)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ═══ MARKET.IO TERMINAL ═══ */}
        <div style={{
          marginBottom: 24, padding: "20px 18px", borderRadius: 12,
          background: TERM_BG, border: `1px solid ${TERM_DIM}33`,
        }}>
          {/* Header bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: TERM, letterSpacing: 1 }}>market.io</span>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: C.textDim }}>{"\u{1F392}"} {inventory.length}/{inventoryCap}</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: TERM }}>{"\u{1FA99}"} {playerGold}</span>
            </div>
          </div>

          {/* ASCII octopus */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <pre style={{
              fontFamily: "monospace", fontSize: 11, lineHeight: 1.2,
              color: TERM, margin: 0, display: "inline-block", textAlign: "left",
              opacity: 0.7,
            }}>{OCTOPUS_ASCII}</pre>
          </div>

          {/* Typewriter quote */}
          <div style={{ fontFamily: "monospace", fontSize: 13, color: TERM, lineHeight: 1.6, minHeight: 42 }}>
            <span>{greeting.displayed}</span>
            {!greeting.done && <span style={{ animation: "pulse 0.8s ease infinite" }}>{"\u2588"}</span>}
          </div>
        </div>

        {/* ═══ TEST YOUR LUCK — CHESTS ═══ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: C.textDim, letterSpacing: 1, marginBottom: 12 }}>Test your luck...</div>
          <div style={{ display: "flex", gap: 10 }}>
            {CHEST_DISPLAY.map(chest => {
              const canAfford = playerGold >= chest.price;
              return (
                <div key={chest.id} onClick={() => { if (canAfford) handleOpenChest(chest); }} style={{
                  flex: 1, padding: "14px 8px", borderRadius: 10, cursor: canAfford ? "pointer" : "default",
                  background: C.surface, border: `1px solid ${C.border}`,
                  opacity: canAfford ? 1 : 0.35, textAlign: "center",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, margin: "0 auto 8px",
                    background: `${chest.color}22`, border: `2px solid ${chest.color}66`,
                  }} />
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted }}>{chest.price}g</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ THIS WEEK'S STOCK ═══ */}
        <div>
          <SectionHeader color={TERM}>This week's stock</SectionHeader>
          {weeklyStock.length === 0 ? (
            <div style={{ fontFamily: "monospace", fontSize: 12, color: C.textDim, padding: "16px 0" }}>{">> "} Stock depleted. Come back Monday.</div>
          ) : (
            <div>
              {weeklyStock.map((item, i) => {
                const rarity = RARITIES[item.rarity];
                const slot = SLOTS[item.slot];
                const canAfford = playerGold >= item.price;
                const meetsLevel = playerLevel >= item.levelReq;
                const wasBought = justBought === item.id;
                return (
                  <div key={item.id} onClick={() => { if (!wasBought) setInspectItem(item); }} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 4px",
                    borderBottom: i < weeklyStock.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: wasBought ? "default" : "pointer", opacity: wasBought ? 0.3 : 1,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `${rarity.color}15`, border: `1px solid ${rarity.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}>{slot.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: rarity.color }}>{item.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                        {Object.entries(item.stats).map(([stat, val]) => (
                          <span key={stat} style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: val > 0 ? C.greenFaint : "rgba(239,68,68,0.12)", color: val > 0 ? C.green : "#ef4444" }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                    {wasBought ? (
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: TERM }}>sold</span>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: canAfford ? C.gold : C.textDim }}>{item.price}g</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ ITEM INSPECT MODAL ═══ */}
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
                  <button onClick={() => handleBuy(inspectItem)} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: C.green, color: "#fff" }}>Confirm {"\u2014"} {inspectItem.price}g</button>
                ) : (
                  <button onClick={() => { if (canBuy) setBuyConfirm(inspectItem.id); }} disabled={!canBuy} style={{
                    width: "100%", padding: "14px", borderRadius: 20, border: "none",
                    cursor: canBuy ? "pointer" : "default", fontSize: 15, fontWeight: 600,
                    background: canBuy ? C.gold : C.surfaceLight, color: canBuy ? "#000" : C.textDim, opacity: canBuy ? 1 : 0.5,
                  }}>
                    {isFull ? "Inventory full" : !canAfford ? `Need ${inspectItem.price - playerGold} more gold` : !meetsLevel ? `Requires Level ${inspectItem.levelReq}` : `Buy \u2014 ${inspectItem.price}g`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ width: "100%", padding: "12px", borderRadius: 20, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 500 }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ CHEST OPENING MODAL ═══ */}
      {openingChest && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!chestResult ? (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 14, margin: "0 auto 20px",
                  background: `${openingChest.color}22`, border: `2px solid ${openingChest.color}66`,
                  animation: "pulse 0.6s ease infinite",
                }} />
                <div style={{ fontFamily: "monospace", fontSize: 14, color: TERM }}>{">> "} Processing...</div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: C.textDim, letterSpacing: 1, marginBottom: 12 }}>{">> "} Transaction complete</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "monospace", color: C.gold, marginBottom: 8 }}>+{chestResult.gold}g</div>
                {chestResult.item ? (
                  <>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: TERM, marginBottom: 12 }}>{">> "} Item acquired</div>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{SLOTS[chestResult.item.slot].emoji}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: RARITIES[chestResult.item.rarity].color, marginBottom: 4 }}>{chestResult.item.name}</div>
                    <div style={{ fontSize: 11, color: RARITIES[chestResult.item.rarity].color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>{RARITIES[chestResult.item.rarity].label} {SLOTS[chestResult.item.slot].label}</div>
                  </>
                ) : (
                  <div style={{ fontFamily: "monospace", fontSize: 13, color: C.textDim, marginBottom: 20, marginTop: 8 }}>{">> "} No item. Better luck next time.</div>
                )}
                <button onClick={() => { setOpeningChest(null); setChestResult(null); }} style={{
                  padding: "14px 48px", borderRadius: 20, border: "none", cursor: "pointer",
                  background: chestResult.item ? RARITIES[chestResult.item.rarity].color : C.gold,
                  color: "#000", fontSize: 15, fontWeight: 600,
                }}>OK</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}