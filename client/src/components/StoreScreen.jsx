import { useState, useMemo, useEffect } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, RANKS, getItem } from '../equipmentData';
import { STORE_CHESTS, rollChest } from '../chestSystem';

// ═══════════════════════════════════════
// MARK.ET — THE ANONYMOUS TRADER
// ═══════════════════════════════════════

const T = "#33cc66";
const TD = "#1a7a3a";
const TBG = "rgba(51, 204, 102, 0.04)";
const MONO = "'Courier New', 'Consolas', monospace";

const MARKET_PASSAGES = [
  "The market doesn't care how hard your week was.\nIt asks one question: did you produce?\nGet back to work.\n\nI have inventory to move.",
  "Discipline is not a personality trait.\nIt is a price you pay daily.\nYou're behind on payments.\n\nBrowse. Buy something. We both have debts.",
  "You are an asset.\nRight now, you are a depreciating one.\nThat changes when you do.\n\nAre you here to buy or waste bandwidth?",
  "Every asset has a shelf life.\nSkills. Contacts. Courage.\nIf you're not maintaining them, they rot.\n\nThis stock rotates Monday. So does my location.\nBuy before we both disappear.",
  "Comfort is a product, not a reward.\nThey package it, price it, sell it to you\nso you stop building things that threaten them.\n\nThe most expensive thing I ever bought was safety.\nIt didn't last. Buy something useful instead.",
  "Supply doesn't care about your feelings.\nDemand doesn't negotiate.\nPrice is the only honest language left.\n\nI used to say this from a high-rise.\nNow I say it from a signal I reroute four times.\nSame truth. Different altitude.",
  "There are only three real currencies:\nwhat you know, what you can prove,\nand what they can't take from you.\n\nEverything else is someone else's ledger.\nI keep my own books now. Browse.",
  "Scarcity creates value.\nThat's why your time is worthless to you\nand expensive to everyone else.\n\nInvert that.\n\nI did. That's the only reason I'm still in business.",
  "Inflation isn't just money.\nIt's promises. Commitments. Words.\nThe more you print, the less each one is worth.\n\nI've watched entire economies collapse\nbecause someone said 'trust me' too many times.\nBuy something real.",
  "Liquidity is survival.\nThe ability to move \u2014 money, yourself, your mind \u2014\nfaster than the situation changes.\n\nI used to move numbers across borders.\nNow I move myself.\nSame principle. Higher stakes. Shop.",
  "Markets in Lagos still run on handshakes.\nMarkets in Zurich run on signatures.\nBoth can be broken.\n\nThe difference is what it costs you after.\nI know the price list for both.\nWhat do you need?",
  "The beautiful thing about decentralized markets\nis that no one controls them.\nThe terrible thing\nis that no one controls them.\n\nI learned the difference the expensive way.\nYou can learn it cheap. Browse.",
  "Utility is the only honest measure of value.\nWater in a city is cheap.\nWater in a desert will cost you everything you own.\n\nI've priced water in both.\nThe desert doesn't negotiate.\nNeither do I.",
  "A contact in Kinshasa taught me something:\nvalue isn't what something costs.\nIt's what you lose without it.\n\nHe's gone now.\nPast tense is the most expensive word in any language.\nShop fast.",
  "There was a week where I stopped sleeping.\nNot because of the markets.\nBecause of what I saw moving behind them.\n\nInformation asymmetry is the real currency.\nThe less you know, the more you pay.\nI'm selling you a discount. Take it.",
  "Some transactions aren't recorded.\nSome ledgers aren't on any server.\nI read one once.\n\nThe lesson: knowing the price of something\nand knowing its cost are two different educations.\nI've had both. You can't afford the second.\nBuy gear instead.",
  "Sunk cost is the most dangerous bias.\nPeople hold losing positions because\nthey've already paid too much to walk away.\n\nThat's how you end up in rooms you shouldn't be in,\nholding things you shouldn't have.\nCut your losses. Buy something useful.",
  "They didn't come for me because I took anything.\nThey came because I saw the receipt.\n\nLies compound faster than interest.\nEvery small one requires a bigger one to protect it.\nEventually the principal comes due\nand you can't cover the spread.\nDon't be leveraged by your own mouth.",
  "I trusted three people.\nOne is dead. One owes me enough\nthat silence is cheaper than what I know.\nThe third is the reason I'm here.\n\nCounterparty risk. Look it up.\nOr just buy armor.",
  "Money doesn't lie.\nPoliticians lie. Markets correct.\nPromises inflate. Prices don't.\n\nI sell gear because gear has no agenda.\nIt doesn't overpromise. It doesn't lobby.\nIt does what it says on the label.\nThat's rare. Buy some.",
  "You think risk is exciting.\nRisk is paperwork and adrenaline and regret.\nThe people who glorify risk\nhave never filled out a customs form at 3am\nin a country they weren't supposed to be in.\n\nManage your risk. Buy something.",
  "I rerouted this signal four times today.\nIf you're reading this, it worked.\n\nRedundancy is an investment, not an expense.\nBackup plans. Backup routes. Backup identities.\n\nYou have one life.\nBuild redundancy into it.\nStart with better gear.",
  "Lies compound faster than interest.\nEvery small lie requires a bigger one to protect it.\nEventually the principal comes due\nand you can't cover the spread.\n\nI've watched smart men drown in their own leverage.\nStay solvent. Buy something honest.",
  "You come here every week.\nYou look at the stock. You hesitate.\nYou leave.\n\nThe market punishes hesitation.\nI am the market.\nDecide.",
  "I don't know your name.\nI don't want to know your name.\nNames are liabilities.\n\nYou're a wallet and a level to me.\nThat's not cruelty. That's efficiency.\nWhat are you buying?",
];

const SLOT_SYMBOLS = ['#', '$', '7', '%', '&', '@', '!', '*', '+', '='];
const SLOT_MACHINES = [
  { id: "iron", price: 50, winSymbol: "#", label: "50g", color: "#22c55e", icon: "/slot-green.png" },
  { id: "runed", price: 200, winSymbol: "$", label: "200g", color: "#3b82f6", icon: "/slot-blue.png" },
  { id: "shadow", price: 600, winSymbol: "7", label: "600g", color: "#a855f7", icon: "/slot-purple.png" },
  { id: "mystery", price: 150, winSymbol: "?", label: "150g", color: "#f59e0b", icon: "/slot-gold.png" },
];

// ── Typewriter hook ──
function useTypewriter(text, speed = 20, startDelay = 0, active = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    setDisplayed(""); setDone(false);
    const dt = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) { clearInterval(iv); setDone(true); } }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(dt);
  }, [text, speed, startDelay, active]);
  return { displayed, done };
}

// ── Slot machine hook ──
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

// ── Utility ──
function getDaySeed(userId = "") { return (new Date().toISOString().split("T")[0] + userId).split("").reduce((a, c) => a + c.charCodeAt(0), 0); }
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

// ═══ BOOT SEQUENCE ═══
const BOOT_LINES = [
  { text: ">> contacting seller", delay: 0, dots: true },
  { text: ">> connection established", delay: 3500 },
  { text: ">> Mark.et has entered the chat", delay: 4500 },
  { text: ">> location: BLOCKED", delay: 5500 },
];
const BOOT_TOTAL = 6500; // ms before main screen shows

function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(prev => [...prev, i]), line.delay)
    );
    const completeTimer = setTimeout(onComplete, BOOT_TOTAL);
    return () => { timers.forEach(clearTimeout); clearTimeout(completeTimer); };
  }, []);

  // Animate dots for first line
  useEffect(() => {
    const iv = setInterval(() => setDotCount(prev => (prev + 1) % 4), 800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#050505", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative",
    }}>
      {/* Scanlines */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(51,204,102,0.15) 2px, rgba(51,204,102,0.15) 4px)" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 320 }}>
        {BOOT_LINES.map((line, i) => {
          if (!visibleLines.includes(i)) return null;
          const isFirst = i === 0;
          return (
            <div key={i} style={{
              fontFamily: MONO, fontSize: 13, color: i === 2 ? T : TD,
              marginBottom: 10, animation: "fadeIn 0.3s ease",
              fontWeight: i === 2 ? 700 : 400,
            }}>
              {isFirst ? `${line.text} ${'.'.repeat(dotCount)}` : line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, onChestReward, inventoryCap = 50 }) {
  const [booted, setBooted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [justBought, setJustBought] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotResult, setSlotResult] = useState(null);
  const { reels, locked, phase } = useSlotMachine(slotSpinning, activeSlot);

  const weeklyStock = useMemo(() => generateWeeklyStock(playerLevel, userId, inventory), [playerLevel, userId, inventory]);
  const isFull = inventory.length >= inventoryCap;
  const todayPassage = useMemo(() => MARKET_PASSAGES[getDaySeed(userId) % MARKET_PASSAGES.length], [userId]);
  const passage = useTypewriter(todayPassage, 18, 1500, showGreeting);

  // Trigger greeting typewriter after boot
  useEffect(() => { if (booted) { const t = setTimeout(() => setShowGreeting(true), 800); return () => clearTimeout(t); } }, [booted]);

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

  // ── BOOT SCREEN ──
  if (!booted) return <BootSequence onComplete={() => setBooted(true)} />;

  // ── MAIN TERMINAL ──
  return (
    <div style={{ padding: "0 0 120px", minHeight: "100vh", background: "#050505", animation: "fadeIn 0.5s ease", position: "relative" }}>
      {/* Scanline overlay — FULL SCREEN */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(51,204,102,0.15) 2px, rgba(51,204,102,0.15) 4px)" }} />

      {/* Full terminal container — green tint extends through everything */}
      <div style={{ position: "relative", zIndex: 1, background: TBG, minHeight: "100vh", padding: "24px 18px 40px" }}>

        {/* ═══ MARK.ET HEADER ═══ */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: T, letterSpacing: 4 }}>Mark.et</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: TD, letterSpacing: 2, marginTop: 4 }}>ANONYMOUS TRADER {"\u2022"} LOCATION UNKNOWN</div>
        </div>

        {/* Octopus image */}
        <div style={{ textAlign: "center", margin: "16px 0 20px" }}>
          {imgError ? (
            <div style={{ fontSize: 56, opacity: 0.5 }}>{"\u{1F419}"}</div>
          ) : (
            <img
              src="/market-octopus.png" alt="Mark.et"
              onError={() => setImgError(true)}
              style={{ width: 160, height: 160, objectFit: "contain", opacity: 0.85 }}
            />
          )}
        </div>

        {/* Salutation sequence */}
        <div style={{ fontFamily: MONO, fontSize: 11, color: TD, marginBottom: 6 }}>{">> welcome . . ."}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: TD, marginBottom: 6 }}>{">> market conditions: unchanged"}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: T, marginBottom: 16 }}>{">> you: variable"}</div>

        {/* Passage box */}
        <div style={{ padding: "14px 16px", background: "rgba(51, 204, 102, 0.03)", border: `1px solid ${TD}22`, marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: T, lineHeight: 1.8, whiteSpace: "pre-wrap", minHeight: 80 }}>
            {showGreeting && (
              <>
                <span>{passage.displayed}</span>
                {!passage.done && <span style={{ animation: "pulse 0.8s ease infinite" }}>{"\u2588"}</span>}
              </>
            )}
          </div>
        </div>

        {/* ═══ SLOT MACHINES ═══ */}
        <div style={{ fontFamily: MONO, fontSize: 10, color: TD, letterSpacing: 1, marginBottom: 10 }}>{">> pull_lever()"}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {SLOT_MACHINES.map(m => {
            const canAfford = playerGold >= m.price;
            return (
              <div key={m.id} onClick={() => { if (canAfford && !slotSpinning) handlePull(m); }} style={{
                flex: 1, padding: "8px 4px", cursor: canAfford && !slotSpinning ? "pointer" : "default",
                background: "transparent", border: `1px solid ${canAfford ? m.color + '44' : TD + '22'}`,
                opacity: canAfford ? 1 : 0.25, textAlign: "center",
              }}>
                <img src={m.icon} alt={m.id} style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 4 }} onError={e => { e.target.style.display = "none"; }} />
                <div style={{ fontFamily: MONO, fontSize: 9, color: TD }}>{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* ═══ SEPARATOR ═══ */}
        <div style={{ fontFamily: MONO, fontSize: 10, color: TD, opacity: 0.4, marginBottom: 20 }}>{"\u2500".repeat(44)}</div>

        {/* ═══ YOUR INVENTORY / STOCK ═══ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${TD}22` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: TD, letterSpacing: 1 }}>{">> your_inventory"}</div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: isFull ? "#ef4444" : inventory.length >= inventoryCap * 0.8 ? "#f59e0b" : TD }}>[{inventory.length}/{inventoryCap}]</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T }}>[{playerGold}g]</span>
          </div>
        </div>

        <div style={{ fontFamily: MONO, fontSize: 10, color: TD, letterSpacing: 1, marginBottom: 4 }}>{">> this_weeks_stock()"}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: TD, marginBottom: 12 }}>{">> refreshes: monday"}</div>

        {weeklyStock.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 12, color: TD, padding: "16px 0" }}>{">> stock depleted. come back monday."}</div>
        ) : (
          <div>
            {weeklyStock.map((item, i) => {
              const rarity = RARITIES[item.rarity];
              const canAfford = playerGold >= item.price;
              const wasBought = justBought === item.id;
              return (
                <div key={item.id} onClick={() => { if (!wasBought) setInspectItem(item); }} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 0",
                  borderBottom: i < weeklyStock.length - 1 ? `1px solid ${TD}18` : "none",
                  cursor: wasBought ? "default" : "pointer", opacity: wasBought ? 0.2 : 1,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: TD, flexShrink: 0 }}>{">"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: rarity.color }}>{item.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
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
        <div style={{ fontFamily: MONO, fontSize: 10, color: TD }}>{">> end_of_transmission"}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: TD, marginTop: 4, animation: "pulse 1.5s ease infinite" }}>{"\u2588"}</div>
      </div>

      {/* ═══ SLOT MACHINE MODAL ═══ */}
      {(slotSpinning || slotResult) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!slotResult ? (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: TD, letterSpacing: 1, marginBottom: 24 }}>{">> processing transaction..."}</div>
                <div style={{ display: "inline-block", padding: "20px 28px", border: `1px solid ${TD}55`, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                    {reels.map((sym, i) => (
                      <div key={i} style={{
                        width: 60, height: 72, display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${locked[i] ? T : TD + '33'}`,
                        background: locked[i] ? `${T}0a` : "transparent", transition: "all 0.15s ease",
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 36, fontWeight: 700, color: locked[i] ? T : TD }}>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: TD }}>
                  {phase === 'spinning' && "[ spinning... ]"}
                  {phase === 'locking' && `[ ${locked.filter(Boolean).length}/3 locked ]`}
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: TD, letterSpacing: 1, marginBottom: 16 }}>{">> transaction complete"}</div>
                <div style={{ display: "inline-block", padding: "12px 24px", border: `1px solid ${T}33`, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {reels.map((sym, i) => (
                      <div key={i} style={{ width: 48, height: 56, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T}55`, background: `${T}0a` }}>
                        <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: T }}>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: T, marginBottom: 8 }}>+{slotResult.gold}g</div>
                {slotResult.item ? (
                  <>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: TD, marginBottom: 12 }}>{">> item acquired"}</div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{SLOTS[slotResult.item.slot].emoji}</div>
                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: RARITIES[slotResult.item.rarity].color, marginBottom: 4 }}>{slotResult.item.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: RARITIES[slotResult.item.rarity].color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>{RARITIES[slotResult.item.rarity].label} {SLOTS[slotResult.item.slot].label}</div>
                  </>
                ) : (
                  <div style={{ fontFamily: MONO, fontSize: 11, color: TD, marginBottom: 20, marginTop: 8 }}>{">> no item. better luck next time."}</div>
                )}
                <button onClick={() => { setSlotResult(null); setActiveSlot(null); }} style={{
                  padding: "12px 40px", border: `1px solid ${T}55`, cursor: "pointer",
                  background: "transparent", fontFamily: MONO, color: T, fontSize: 13, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
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
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${TD}44` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: TD, letterSpacing: 1, marginBottom: 14 }}>{">> inspect_item()"}</div>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{slot.emoji}</div>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: rarity.color, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: TD, marginTop: 10, lineHeight: 1.6 }}>{inspectItem.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
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
                  <button onClick={() => handleBuy(inspectItem)} style={{ width: "100%", padding: "12px", border: `1px solid ${T}`, cursor: "pointer", background: `${T}11`, fontFamily: MONO, color: T, fontSize: 13, fontWeight: 600, borderRadius: 0 }}>[ CONFIRM: {inspectItem.price}g ]</button>
                ) : (
                  <button onClick={() => { if (canBuy) setBuyConfirm(inspectItem.id); }} disabled={!canBuy} style={{
                    width: "100%", padding: "12px", border: `1px solid ${canBuy ? T + '55' : TD + '22'}`,
                    cursor: canBuy ? "pointer" : "default", background: "transparent", borderRadius: 0,
                    fontFamily: MONO, color: canBuy ? T : TD, fontSize: 13, fontWeight: 600, opacity: canBuy ? 1 : 0.5,
                  }}>
                    {isFull ? "[ INVENTORY FULL ]" : !canAfford ? `[ NEED ${inspectItem.price - playerGold}g MORE ]` : !meetsLevel ? `[ LEVEL ${inspectItem.levelReq} REQ ]` : `[ BUY: ${inspectItem.price}g ]`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{ width: "100%", padding: "10px", border: `1px solid ${TD}22`, cursor: "pointer", background: "transparent", fontFamily: MONO, color: TD, fontSize: 11, borderRadius: 0 }}>[ CLOSE ]</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}