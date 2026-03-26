import { useState, useMemo, useEffect, useCallback } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, RANKS, getItem } from '../equipmentData';
import { STORE_CHESTS, rollChest } from '../chestSystem';

// ═══════════════════════════════════════
// MARKET.IO — TERMINAL AESTHETIC
// ═══════════════════════════════════════

const T = "#33cc66";       // terminal green
const TD = "#1a7a3a";      // terminal dim
const TBG = "rgba(51, 204, 102, 0.04)";
const MONO = "'Courier New', 'Consolas', monospace";

const OCTOPUS = [
  "              _,-'`'-._              ",
  "           ,-'    $    '-,           ",
  "         ,'    .-\"\"\"-,    ',         ",
  "        /    ,'       ',    \\        ",
  "       ;    ;   (0) (0)  ;    ;      ",
  "       |   |      /\\     |   |      ",
  "       ;    ;    '--'   ;    ;       ",
  "        \\    '-,_____,-'    /        ",
  "     ,---'-.    \\   /    .-'---,     ",
  "    /  ;    '-._|||_.-'    ;  \\    ",
  "   /  / \\      |   |      / \\  \\   ",
  "  /  /   \\    /|   |\\    /   \\  \\  ",
  " ;  ;     \\  / |   | \\  /     ;  ;  ",
  " |  |      \\/ /|   |\\ \\/      |  |  ",
  " ;  ;      ; / |   | \\ ;      ;  ;  ",
  "  \\  \\    / /  |   |  \\ \\    /  /   ",
  "   \\  \\  / /  _|   |_  \\ \\  /  /    ",
  "    '-._\\/ / -'       '- \\ \\/-.'     ",
  "        '-.\\             /.-'        ",
  "            '-.______.-'             ",
].join('\n');

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

// Slot symbols
const SLOT_SYMBOLS = ['#', '$', '7', '%', '&', '@', '!', '*', '+', '='];
const SLOT_MACHINES = [
  { id: "iron", price: 50, winSymbol: "#", label: "50g", color: "#22c55e" },
  { id: "runed", price: 200, winSymbol: "$", label: "200g", color: "#3b82f6" },
  { id: "shadow", price: 600, winSymbol: "7", label: "600g", color: "#a855f7" },
  { id: "mystery", price: 150, winSymbol: "?", label: "150g", color: "#f59e0b" },
];

// ── Typewriter hook ──
function useTypewriter(text, speed = 25, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    const dt = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) { clearInterval(iv); setDone(true); } }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(dt);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

// ── Slot machine animation hook ──
function useSlotMachine(spinning, chestId) {
  const [reels, setReels] = useState(['#', '#', '#']);
  const [locked, setLocked] = useState([false, false, false]);
  const [phase, setPhase] = useState('idle'); // idle, spinning, locking, done

  useEffect(() => {
    if (!spinning) { setPhase('idle'); setLocked([false, false, false]); return; }
    setPhase('spinning');
    setLocked([false, false, false]);

    // Spin all reels rapidly
    const spinIv = setInterval(() => {
      setReels(prev => prev.map((_, i) => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]));
    }, 60);

    // Lock reel 0 at 800ms
    const t1 = setTimeout(() => {
      const machine = SLOT_MACHINES.find(m => m.id === chestId);
      const sym = machine?.winSymbol || '#';
      setReels(prev => [sym, prev[1], prev[2]]);
      setLocked([true, false, false]);
      setPhase('locking');
    }, 800);

    // Lock reel 1 at 1400ms
    const t2 = setTimeout(() => {
      const machine = SLOT_MACHINES.find(m => m.id === chestId);
      const sym = machine?.winSymbol || '#';
      setReels(prev => [prev[0], sym, prev[2]]);
      setLocked([true, true, false]);
    }, 1400);

    // Lock reel 2 at 2000ms
    const t3 = setTimeout(() => {
      const machine = SLOT_MACHINES.find(m => m.id === chestId);
      const sym = machine?.winSymbol || '#';
      // Mystery chest: random result
      const finalSym = sym === '?' ? ['#', '$', '7'][Math.floor(Math.random() * 3)] : sym;
      setReels(prev => [prev[0], prev[1], finalSym]);
      setLocked([true, true, true]);
      setPhase('done');
    }, 2000);

    return () => { clearInterval(spinIv); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [spinning, chestId]);

  return { reels, locked, phase };
}

// ── Utility ──
function getDaySeed(userId = "") {
  const d = new Date().toISOString().split("T")[0];
  return (d + userId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s >>> 0) / 0x7fffffff; };
}
function getWeekSeed(userId = "") {
  const now = new Date();
  const soy = new Date(now.getFullYear(), 0, 1);
  const wk = Math.floor((now - soy) / (7 * 24 * 60 * 60 * 1000));
  return `${now.getFullYear()}-W${wk}-${userId}`.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}
function generateWeeklyStock(playerLevel, userId, ownedIds = []) {
  const rng = seededRandom(getWeekSeed(userId));
  const ranks = RANKS.filter(r => r.level <= playerLevel + 5);
  if (ranks.length === 0) ranks.push(RANKS[0]);
  const stock = [];
  ranks.forEach(rank => {
    Object.keys(RARITIES).forEach(rarity => {
      const c = ITEMS.filter(i => i.levelReq === rank.level && i.rarity === rarity && !ownedIds.includes(i.id));
      if (c.length) stock.push([...c].sort(() => rng() - 0.5)[0]);
    });
  });
  return stock;
}

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, onChestReward, inventoryCap = 50 }) {
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [justBought, setJustBought] = useState(null);

  // Slot machine state
  const [activeSlot, setActiveSlot] = useState(null); // which chest is being pulled
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotResult, setSlotResult] = useState(null); // { gold, item } after spin
  const { reels, locked, phase } = useSlotMachine(slotSpinning, activeSlot);

  const weeklyStock = useMemo(() => generateWeeklyStock(playerLevel, userId, inventory), [playerLevel, userId, inventory]);
  const isFull = inventory.length >= inventoryCap;
  const todayQuote = useMemo(() => MARKET_QUOTES[getDaySeed(userId) % MARKET_QUOTES.length], [userId]);
  const greeting = useTypewriter(`>> ${todayQuote}`, 25, 800);

  const handlePull = (machine) => {
    if (playerGold < machine.price || slotSpinning) return;
    setActiveSlot(machine.id);
    setSlotSpinning(true);
    setSlotResult(null);

    // Roll the actual chest result
    const chestDef = STORE_CHESTS.find(c => c.id === machine.id);
    const result = rollChest(chestDef, playerLevel, isFull ? ITEMS.map(i => i.id) : inventory);

    // Process reward immediately (gold deducted)
    onChestReward?.(machine.price, result.gold, result.item);

    // Show result after animation completes
    setTimeout(() => {
      setSlotSpinning(false);
      setSlotResult(result);
    }, 2200);
  };

  const handleBuy = (item) => {
    if (playerGold < item.price || playerLevel < item.levelReq || isFull) return;
    onBuy?.(item.id, item.price);
    setJustBought(item.id); setBuyConfirm(null); setInspectItem(null);
    setTimeout(() => setJustBought(null), 2000);
  };

  // Terminal line component
  const Line = ({ children, dim, indent }) => (
    <div style={{ fontFamily: MONO, fontSize: 12, color: dim ? TD : T, lineHeight: 1.6, paddingLeft: indent ? 16 : 0 }}>{children}</div>
  );

  return (
    <div style={{ padding: "0 0 120px", minHeight: "100vh", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
      {/* Scanline overlay */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 0, opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(51,204,102,0.15) 2px, rgba(51,204,102,0.15) 4px)",
      }} />

      {/* ═══ FULL TERMINAL INTERFACE ═══ */}
      <div style={{ position: "relative", zIndex: 1, padding: "20px 18px", background: TBG, minHeight: "100vh", borderLeft: `1px solid ${TD}22`, borderRight: `1px solid ${TD}22` }}>

        {/* Terminal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, paddingBottom: 8, borderBottom: `1px solid ${TD}33` }}>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: T, letterSpacing: 1 }}>market.io</span>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: TD }}>[inv {inventory.length}/{inventoryCap}]</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T }}>[{playerGold}g]</span>
          </div>
        </div>

        {/* Connection status */}
        <Line dim>{">> connection established"}</Line>
        <Line dim>{">> location: [REDACTED]"}</Line>
        <Line dim>{">> status: active"}</Line>
        <div style={{ height: 12 }} />

        {/* ASCII Octopus */}
        <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
          <pre style={{
            fontFamily: MONO, fontSize: 9, lineHeight: 1.2,
            color: T, margin: 0, display: "inline-block", textAlign: "left",
            opacity: 0.5,
          }}>{OCTOPUS}</pre>
        </div>

        {/* Typewriter greeting */}
        <div style={{ fontFamily: MONO, fontSize: 13, color: T, lineHeight: 1.7, marginBottom: 4, minHeight: 24 }}>
          <span>{greeting.displayed}</span>
          {!greeting.done && <span style={{ animation: "pulse 0.8s ease infinite", color: T }}>{"\u2588"}</span>}
        </div>
        <div style={{ height: 20 }} />

        {/* ═══ SLOT MACHINES ═══ */}
        <Line dim>{">> test_your_luck()"}</Line>
        <div style={{ height: 8 }} />

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {SLOT_MACHINES.map(m => {
            const canAfford = playerGold >= m.price;
            return (
              <div key={m.id} onClick={() => { if (canAfford && !slotSpinning) handlePull(m); }} style={{
                flex: 1, padding: "12px 6px", borderRadius: 0, cursor: canAfford && !slotSpinning ? "pointer" : "default",
                background: "transparent", border: `1px solid ${canAfford ? m.color + '66' : TD + '33'}`,
                opacity: canAfford ? 1 : 0.3, textAlign: "center",
              }}>
                <div style={{
                  fontFamily: MONO, fontSize: 20, fontWeight: 700, color: m.color,
                  marginBottom: 4, lineHeight: 1,
                }}>{m.winSymbol === '?' ? '?' : m.winSymbol}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: TD }}>{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <Line dim>{"─".repeat(40)}</Line>
        <div style={{ height: 12 }} />

        {/* ═══ WEEKLY STOCK ═══ */}
        <Line dim>{">> this_weeks_stock()"}</Line>
        <Line dim>{`>> refreshes: monday`}</Line>
        <div style={{ height: 8 }} />

        {weeklyStock.length === 0 ? (
          <Line dim>{">> stock depleted. come back monday."}</Line>
        ) : (
          <div>
            {weeklyStock.map((item, i) => {
              const rarity = RARITIES[item.rarity];
              const canAfford = playerGold >= item.price;
              const wasBought = justBought === item.id;
              return (
                <div key={item.id} onClick={() => { if (!wasBought) setInspectItem(item); }} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                  borderBottom: i < weeklyStock.length - 1 ? `1px solid ${TD}22` : "none",
                  cursor: wasBought ? "default" : "pointer", opacity: wasBought ? 0.2 : 1,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: TD, flexShrink: 0 }}>{">"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: rarity.color }}>{item.name}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                      {Object.entries(item.stats).map(([stat, val]) => (
                        <span key={stat} style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: val > 0 ? T : "#ef4444" }}>{val > 0 ? "+" : ""}{val}{stat.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                  {wasBought ? (
                    <span style={{ fontFamily: MONO, fontSize: 10, color: T }}>SOLD</span>
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: canAfford ? T : TD }}>{item.price}g</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 16 }} />
        <Line dim>{">> end_of_transmission"}</Line>
        <div style={{ fontFamily: MONO, fontSize: 10, color: TD, marginTop: 4, animation: "pulse 1.5s ease infinite" }}>{"\u2588"}</div>
      </div>

      {/* ═══ SLOT MACHINE MODAL ═══ */}
      {(slotSpinning || slotResult) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!slotResult ? (
              /* Spinning reels */
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: TD, letterSpacing: 1, marginBottom: 20 }}>{">> processing transaction..."}</div>

                {/* Slot machine frame */}
                <div style={{ display: "inline-block", padding: "16px 24px", border: `1px solid ${TD}66`, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    {reels.map((sym, i) => (
                      <div key={i} style={{
                        width: 56, height: 64, display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${locked[i] ? T : TD + '44'}`,
                        background: locked[i] ? `${T}11` : "transparent",
                        transition: "all 0.2s ease",
                      }}>
                        <span style={{
                          fontFamily: MONO, fontSize: 32, fontWeight: 700,
                          color: locked[i] ? T : TD,
                        }}>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontFamily: MONO, fontSize: 11, color: TD }}>
                  {phase === 'spinning' && "[ spinning... ]"}
                  {phase === 'locking' && `[ ${locked.filter(Boolean).length}/3 locked ]`}
                </div>
              </div>
            ) : (
              /* Result */
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: TD, letterSpacing: 1, marginBottom: 12 }}>{">> transaction complete"}</div>

                {/* Show final reels */}
                <div style={{ display: "inline-block", padding: "12px 20px", border: `1px solid ${T}44`, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {reels.map((sym, i) => (
                      <div key={i} style={{
                        width: 48, height: 56, display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${T}66`, background: `${T}11`,
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: T }}>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: T, marginBottom: 8 }}>+{slotResult.gold}g</div>

                {slotResult.item ? (
                  <>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: TD, marginBottom: 12 }}>{">> item acquired"}</div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{SLOTS[slotResult.item.slot].emoji}</div>
                    <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: RARITIES[slotResult.item.rarity].color, marginBottom: 4 }}>{slotResult.item.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: RARITIES[slotResult.item.rarity].color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>{RARITIES[slotResult.item.rarity].label} {SLOTS[slotResult.item.slot].label}</div>
                  </>
                ) : (
                  <div style={{ fontFamily: MONO, fontSize: 12, color: TD, marginBottom: 20, marginTop: 8 }}>{">> no item. better luck next time."}</div>
                )}

                <button onClick={() => { setSlotResult(null); setActiveSlot(null); }} style={{
                  padding: "12px 40px", borderRadius: 0, border: `1px solid ${T}66`, cursor: "pointer",
                  background: "transparent", fontFamily: MONO, color: T, fontSize: 14, fontWeight: 600, letterSpacing: 1,
                }}>[ OK ]</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ ITEM INSPECT MODAL ═══ */}
      {inspectItem && (() => {
        const rarity = RARITIES[inspectItem.rarity];
        const slot = SLOTS[inspectItem.slot];
        const canAfford = playerGold >= inspectItem.price;
        const meetsLevel = playerLevel >= inspectItem.levelReq;
        const canBuy = canAfford && meetsLevel && !isFull;
        return (
          <div onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${TD}44` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: TD, letterSpacing: 1, marginBottom: 12 }}>{">> item_details()"}</div>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{slot.emoji}</div>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: rarity.color, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: TD, marginTop: 8, lineHeight: 1.6 }}>{inspectItem.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                {Object.entries(inspectItem.stats).map(([stat, val]) => (
                  <span key={stat} style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: val > 0 ? T : "#ef4444" }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
                ))}
              </div>
              {inspectItem.levelReq > 1 && (
                <div style={{ fontFamily: MONO, fontSize: 10, color: meetsLevel ? TD : "#ef4444", textAlign: "center", marginBottom: 12 }}>
                  req_level: {inspectItem.levelReq} {meetsLevel ? "[OK]" : `[DENIED - you: ${playerLevel}]`}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {buyConfirm === inspectItem.id ? (
                  <button onClick={() => handleBuy(inspectItem)} style={{ width: "100%", padding: "12px", border: `1px solid ${T}`, cursor: "pointer", background: `${T}15`, fontFamily: MONO, color: T, fontSize: 13, fontWeight: 600 }}>[ CONFIRM: {inspectItem.price}g ]</button>
                ) : (
                  <button onClick={() => { if (canBuy) setBuyConfirm(inspectItem.id); }} disabled={!canBuy} style={{
                    width: "100%", padding: "12px", border: `1px solid ${canBuy ? T + '66' : TD + '33'}`,
                    cursor: canBuy ? "pointer" : "default", background: "transparent",
                    fontFamily: MONO, color: canBuy ? T : TD, fontSize: 13, fontWeight: 600, opacity: canBuy ? 1 : 0.5,
                  }}>
                    {isFull ? "[ INVENTORY FULL ]" : !canAfford ? `[ INSUFFICIENT: need ${inspectItem.price - playerGold}g ]` : !meetsLevel ? `[ LEVEL ${inspectItem.levelReq} REQ ]` : `[ BUY: ${inspectItem.price}g ]`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ width: "100%", padding: "10px", border: `1px solid ${TD}33`, cursor: "pointer", background: "transparent", fontFamily: MONO, color: TD, fontSize: 12 }}>[ CLOSE ]</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}