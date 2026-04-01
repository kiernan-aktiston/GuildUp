import { useState, useMemo, useEffect } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, RANKS, getItem } from '../equipmentData';
import { STORE_CHESTS, rollChest } from '../chestSystem';

const MONO = "'Courier New', 'Consolas', monospace";

const SLOT_SYMBOLS = ['#', '$', '7', '%', '&', '@', '!', '*', '+', '='];
const SLOT_MACHINES = [
  { id: "iron", price: 50, winSymbol: "#", label: "50g", color: "#4eba6f", icon: "/slot-green.png" },
  { id: "runed", price: 200, winSymbol: "$", label: "200g", color: "#5b9bd5", icon: "/slot-blue.png" },
  { id: "shadow", price: 600, winSymbol: "7", label: "600g", color: "#9b6dcc", icon: "/slot-purple.png" },
  { id: "mystery", price: 150, winSymbol: "?", label: "150g", color: "#e8922d", icon: "/slot-gold.png" },
];

function useSlotMachine(spinning, chestId) {
  const [reels, setReels] = useState(['#', '#', '#']);
  const [locked, setLocked] = useState([false, false, false]);
  const [phase, setPhase] = useState('idle');
  useEffect(() => {
    if (!spinning) { setPhase('idle'); setLocked([false, false, false]); return; }
    setPhase('spinning'); setLocked([false, false, false]);
    const spinIv = setInterval(() => {
      setReels(prev => prev.map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]));
    }, 60);
    const machine = SLOT_MACHINES.find(m => m.id === chestId);
    const sym = machine?.winSymbol || '#';
    const t1 = setTimeout(() => { setReels(prev => [sym, prev[1], prev[2]]); setLocked([true, false, false]); setPhase('locking'); }, 800);
    const t2 = setTimeout(() => { setReels(prev => [prev[0], sym, prev[2]]); setLocked([true, true, false]); }, 1400);
    const t3 = setTimeout(() => {
      const finalSym = sym === '?' ? ['#', '$', '7'][Math.floor(Math.random() * 3)] : sym;
      setReels(prev => [prev[0], prev[1], finalSym]); setLocked([true, true, true]); setPhase('done');
    }, 2000);
    return () => { clearInterval(spinIv); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [spinning, chestId]);
  return { reels, locked, phase };
}

function seededRandom(seed) { let s = seed; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s >>> 0) / 0x7fffffff; }; }
function getWeekSeed(userId = "") { const n = new Date(); return `${n.getFullYear()}-W${Math.floor((n - new Date(n.getFullYear(), 0, 1)) / 604800000)}-${userId}`.split("").reduce((a, c) => a + c.charCodeAt(0), 0); }
function generateWeeklyStock(playerLevel, userId, ownedIds = []) {
  const rng = seededRandom(getWeekSeed(userId));
  const ranks = RANKS.filter(r => r.level <= playerLevel + 5);
  if (ranks.length === 0) ranks.push(RANKS[0]);
  const stock = [];
  ranks.forEach(rank => { Object.keys(RARITIES).forEach(rarity => {
    const c = ITEMS.filter(i => i.levelReq === rank.level && i.rarity === rarity && !ownedIds.includes(i.id));
    if (c.length) stock.push([...c].sort(() => rng() - 0.5)[0]);
  }); });
  return stock;
}

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, onChestReward, inventoryCap = 50 }) {
  const [imgError, setImgError] = useState(false);
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [justBought, setJustBought] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotResult, setSlotResult] = useState(null);
  const { reels, locked, phase: slotPhase } = useSlotMachine(slotSpinning, activeSlot);

  const weeklyStock = useMemo(() => generateWeeklyStock(playerLevel, userId, inventory), [playerLevel, userId, inventory]);
  const isFull = inventory.length >= inventoryCap;

  const handlePull = (machine) => {
    if (playerGold < machine.price || slotSpinning) return;
    setActiveSlot(machine.id); setSlotSpinning(true); setSlotResult(null);
    const chestDef = STORE_CHESTS.find(c => c.id === machine.id);
    const result = rollChest(chestDef, playerLevel, isFull ? ITEMS.map(i => i.id) : inventory);
    onChestReward?.(machine.price, result.gold, result.item);
    setTimeout(() => { setSlotSpinning(false); setSlotResult(result); }, 2200);
  };
  const handleBuy = (item) => {
    if (playerGold < item.price || playerLevel < item.levelReq || isFull) return;
    onBuy?.(item.id, item.price);
    setJustBought(item.id); setBuyConfirm(null); setInspectItem(null);
    setTimeout(() => setJustBought(null), 2000);
  };

  return (
    <div style={{ padding: "16px 18px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease" }}>

      {/* ═══ HEADER ═══ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!imgError && (
            <img src="/market-octopus.png" alt="Market" onError={() => setImgError(true)}
              style={{ width: 36, height: 36, objectFit: "contain", opacity: 0.7 }} />
          )}
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: 2 }}>Market</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, letterSpacing: 1 }}>Refreshes Monday</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: isFull ? C.red : C.textDim }}>[{inventory.length}/{inventoryCap}]</span>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.gold, fontWeight: 600 }}>{playerGold}g</span>
        </div>
      </div>

      {/* ═══ SLOT MACHINES ═══ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.gold, whiteSpace: "nowrap" }}>Chests</span>
          <div style={{ flex: 1, height: 1, background: `${C.gold}33` }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {SLOT_MACHINES.map(m => {
            const canAfford = playerGold >= m.price;
            return (
              <div key={m.id} onClick={() => { if (canAfford && !slotSpinning) handlePull(m); }} style={{
                flex: 1, padding: "10px 4px", cursor: canAfford && !slotSpinning ? "pointer" : "default",
                background: canAfford ? `${m.color}0d` : "transparent",
                border: `1px solid ${canAfford ? m.color + '33' : C.border}`,
                borderRadius: 12, opacity: canAfford ? 1 : 0.3, textAlign: "center",
              }}>
                <img src={m.icon} alt={m.id} style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 4 }} onError={e => { e.target.style.display = "none"; }} />
                <div style={{ fontFamily: MONO, fontSize: 10, color: canAfford ? m.color : C.textDim }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ WEEKLY STOCK ═══ */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.text, whiteSpace: "nowrap" }}>This Week's Stock</span>
          <div style={{ flex: 1, height: 1, background: `${C.text}15` }} />
        </div>

        {weeklyStock.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 14, color: C.textMuted }}>Stock depleted. Come back Monday.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {weeklyStock.map((item, i) => {
              const rarity = RARITIES[item.rarity];
              const canAfford = playerGold >= item.price;
              const wasBought = justBought === item.id;
              return (
                <div key={item.id} onClick={() => { if (!wasBought) setInspectItem(item); }} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`,
                  cursor: wasBought ? "default" : "pointer", opacity: wasBought ? 0.2 : 1,
                }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{SLOTS[item.slot]?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: rarity.color }}>{item.name}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                      {Object.entries(item.stats).map(([stat, val]) => (
                        <span key={stat} style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: val > 0 ? C.green : C.red }}>{val > 0 ? "+" : ""}{val}{stat.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                  {wasBought ? (
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.green }}>SOLD</span>
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: canAfford ? C.gold : C.textDim }}>{item.price}g</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ SLOT MACHINE MODAL ═══ */}
      {(slotSpinning || slotResult) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!slotResult ? (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, letterSpacing: 1, marginBottom: 24 }}>{"> processing..."}</div>
                <div style={{ display: "inline-block", padding: "20px 28px", border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                    {reels.map((sym, i) => (
                      <div key={i} style={{
                        width: 60, height: 72, display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${locked[i] ? C.gold : C.border}`, borderRadius: 8,
                        background: locked[i] ? C.goldFaint : "transparent", transition: "all 0.15s ease",
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 36, fontWeight: 700, color: locked[i] ? C.gold : C.textDim }}>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim }}>
                  {slotPhase === 'spinning' && "[ spinning... ]"}
                  {slotPhase === 'locking' && `[ ${locked.filter(Boolean).length}/3 locked ]`}
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.gold, marginBottom: 8 }}>+{slotResult.gold}g</div>
                {slotResult.item ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{SLOTS[slotResult.item.slot].emoji}</div>
                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: RARITIES[slotResult.item.rarity].color, marginBottom: 4 }}>{slotResult.item.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: RARITIES[slotResult.item.rarity].color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>{RARITIES[slotResult.item.rarity].label} {SLOTS[slotResult.item.slot].label}</div>
                  </>
                ) : (
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, marginBottom: 20, marginTop: 8 }}>Gold only this time.</div>
                )}
                <button onClick={() => { setSlotResult(null); setActiveSlot(null); }} style={{
                  padding: "12px 40px", border: `1px solid ${C.gold}55`, cursor: "pointer",
                  background: "transparent", fontFamily: MONO, color: C.gold, fontSize: 13, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
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
          <div onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{slot.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{inspectItem.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                {Object.entries(inspectItem.stats).map(([stat, val]) => (
                  <div key={stat} style={{ padding: "4px 10px", borderRadius: 8, background: val > 0 ? C.greenFaint : "rgba(216,90,90,0.1)", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: val > 0 ? C.green : C.red }}>{val > 0 ? "+" : ""}{val}</div>
                    <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase" }}>{stat}</div>
                  </div>
                ))}
              </div>
              {inspectItem.levelReq > 1 && (
                <div style={{ fontFamily: MONO, fontSize: 10, color: meetsLevel ? C.textDim : C.red, textAlign: "center", marginBottom: 12 }}>
                  Level {inspectItem.levelReq} required {meetsLevel ? "\u2713" : `(you: ${playerLevel})`}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {buyConfirm === inspectItem.id ? (
                  <button onClick={() => handleBuy(inspectItem)} style={{ width: "100%", padding: "14px", border: `1px solid ${C.gold}`, cursor: "pointer", background: C.goldFaint, fontFamily: MONO, color: C.gold, fontSize: 13, fontWeight: 600, borderRadius: 0 }}>[ CONFIRM: {inspectItem.price}g ]</button>
                ) : (
                  <button onClick={() => { if (canBuy) setBuyConfirm(inspectItem.id); }} disabled={!canBuy} style={{
                    width: "100%", padding: "14px", border: `1px solid ${canBuy ? C.gold + '55' : C.border}`,
                    cursor: canBuy ? "pointer" : "default", background: "transparent", borderRadius: 0,
                    fontFamily: MONO, color: canBuy ? C.gold : C.textDim, fontSize: 13, fontWeight: 600, opacity: canBuy ? 1 : 0.5,
                  }}>
                    {isFull ? "[ INVENTORY FULL ]" : !canAfford ? `[ NEED ${inspectItem.price - playerGold}g MORE ]` : !meetsLevel ? `[ LEVEL ${inspectItem.levelReq} REQ ]` : `[ BUY: ${inspectItem.price}g ]`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, borderRadius: 0 }}>[ CLOSE ]</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}