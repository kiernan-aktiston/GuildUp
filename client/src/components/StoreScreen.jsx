import { useState, useMemo, useEffect } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, RANKS, getItem } from '../equipmentData';
import { STORE_CHESTS, rollChest } from '../chestSystem';

const T = "#33cc66";
const TD = "#1a7a3a";
const TBG = "rgba(51, 204, 102, 0.04)";
const MONO = "'Courier New', 'Consolas', monospace";
const L = { fontFamily: MONO, fontSize: 12, color: TD, lineHeight: 1.8 };

const BROKER_PASSAGES = [
  ">> The market doesn't care how hard your week was.\n>> It asks one question: did you produce?\n>> Get back to work.\n>> I have inventory to move.",
  ">> Discipline is not a personality trait.\n>> It is a price you pay daily.\n>> You're behind on payments.\n>> Browse. Buy something. We both have debts.",
  ">> You are an asset.\n>> Right now, you are a depreciating one.\n>> That changes when you do.\n>> Are you here to buy or waste bandwidth?",
  ">> Every asset has a shelf life.\n>> Skills. Contacts. Courage.\n>> If you're not maintaining them, they rot.\n>> This stock rotates Monday. So does my location.\n>> Buy before we both disappear.",
  ">> Comfort is a product, not a reward.\n>> They package it, price it, sell it to you\n>> so you stop building things that threaten them.\n>> The most expensive thing I ever bought was safety.\n>> It didn't last. Buy something useful instead.",
  ">> Supply doesn't care about your feelings.\n>> Demand doesn't negotiate.\n>> Price is the only honest language left.\n>> I used to say this from a high-rise.\n>> Now I say it from a signal I reroute four times.\n>> Same truth. Different altitude.",
  ">> There are only three real currencies:\n>> what you know, what you can prove,\n>> and what they can't take from you.\n>> Everything else is someone else's ledger.\n>> I keep my own books now. Browse.",
  ">> Scarcity creates value.\n>> That's why your time is worthless to you\n>> and expensive to everyone else.\n>> Invert that.\n>> I did. That's the only reason I'm still in business.",
  ">> Inflation isn't just money.\n>> It's promises. Commitments. Words.\n>> The more you print, the less each one is worth.\n>> I've watched entire economies collapse\n>> because someone said 'trust me' too many times.\n>> Buy something real.",
  ">> Liquidity is survival.\n>> The ability to move \u2014 money, yourself, your mind \u2014\n>> faster than the situation changes.\n>> I used to move numbers across borders.\n>> Now I move myself.\n>> Same principle. Higher stakes. Shop.",
  ">> Markets in Lagos still run on handshakes.\n>> Markets in Zurich run on signatures.\n>> Both can be broken.\n>> The difference is what it costs you after.\n>> I know the price list for both.\n>> What do you need?",
  ">> The beautiful thing about decentralized markets\n>> is that no one controls them.\n>> The terrible thing\n>> is that no one controls them.\n>> I learned the difference the expensive way.\n>> You can learn it cheap. Browse.",
  ">> Utility is the only honest measure of value.\n>> Water in a city is cheap.\n>> Water in a desert will cost you everything you own.\n>> I've priced water in both.\n>> The desert doesn't negotiate.\n>> Neither do I.",
  ">> A contact in Kinshasa taught me something:\n>> value isn't what something costs.\n>> It's what you lose without it.\n>> He's gone now.\n>> Past tense is the most expensive word in any language.\n>> Shop fast.",
  ">> There was a week where I stopped sleeping.\n>> Not because of the markets.\n>> Because of what I saw moving behind them.\n>> Information asymmetry is the real currency.\n>> The less you know, the more you pay.\n>> I'm selling you a discount. Take it.",
  ">> Some transactions aren't recorded.\n>> Some ledgers aren't on any server.\n>> I read one once.\n>> Knowing the price of something\n>> and knowing its cost are two different educations.\n>> I've had both. You can't afford the second.\n>> Buy gear instead.",
  ">> Sunk cost is the most dangerous bias.\n>> People hold losing positions because\n>> they've already paid too much to walk away.\n>> That's how you end up in rooms you shouldn't be in.\n>> Cut your losses. Buy something useful.",
  ">> They didn't come for me because I took anything.\n>> They came because I saw the receipt.\n>> Lies compound faster than interest.\n>> Every small one requires a bigger one to protect it.\n>> Eventually the principal comes due.\n>> Don't be leveraged by your own mouth.",
  ">> I trusted three people.\n>> One is dead. One owes me enough\n>> that silence is cheaper than what I know.\n>> The third is the reason I'm here.\n>> Counterparty risk. Look it up.\n>> Or just buy armor.",
  ">> Money doesn't lie.\n>> Politicians lie. Markets correct.\n>> Promises inflate. Prices don't.\n>> I sell gear because gear has no agenda.\n>> It does what it says on the label.\n>> That's rare. Buy some.",
  ">> You think risk is exciting.\n>> Risk is paperwork and adrenaline and regret.\n>> The people who glorify risk\n>> have never filled out a customs form at 3am\n>> in a country they weren't supposed to be in.\n>> Manage your risk. Buy something.",
  ">> I rerouted this signal four times today.\n>> If you're reading this, it worked.\n>> Redundancy is an investment, not an expense.\n>> Backup plans. Backup routes. Backup identities.\n>> You have one life.\n>> Build redundancy into it.\n>> Start with better gear.",
  ">> Lies compound faster than interest.\n>> Every small lie requires a bigger one to protect it.\n>> Eventually the principal comes due\n>> and you can't cover the spread.\n>> I've watched smart men drown in their own leverage.\n>> Stay solvent. Buy something honest.",
  ">> You come here every week.\n>> You look at the stock. You hesitate.\n>> You leave.\n>> The market punishes hesitation.\n>> I am the market.\n>> Decide.",
  ">> I don't know your name.\n>> I don't want to know your name.\n>> Names are liabilities.\n>> You're a wallet and a level to me.\n>> That's not cruelty. That's efficiency.\n>> What are you buying?",
];

const SLOT_SYMBOLS = ['#', '$', '7', '%', '&', '@', '!', '*', '+', '='];
const SLOT_MACHINES = [
  { id: "iron", price: 50, winSymbol: "#", label: "50g", color: "#22c55e", icon: "/slot-green.png" },
  { id: "runed", price: 200, winSymbol: "$", label: "200g", color: "#3b82f6", icon: "/slot-blue.png" },
  { id: "shadow", price: 600, winSymbol: "7", label: "600g", color: "#a855f7", icon: "/slot-purple.png" },
  { id: "mystery", price: 150, winSymbol: "?", label: "150g", color: "#f59e0b", icon: "/slot-gold.png" },
];

function useTypewriter(text, speed = 18, startDelay = 0, active = true) {
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

// Use day-of-year + userId for daily rotation (not just date string)
function getDaySeed(userId = "") {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return (dayOfYear * 7 + userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % BROKER_PASSAGES.length;
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

// Typed boot lines content
const BOOT_TEXT = "> connection established\n> _the_broker_ has entered the chat\n>> hi\n>> market prices as always\n>> remember";

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], userId = "", onBuy, onChestReward, inventoryCap = 50 }) {
  const [showOctopus, setShowOctopus] = useState(false);
  const [bootReady, setBootReady] = useState(false);
  const [allReady, setAllReady] = useState(false);
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
  const passageIndex = useMemo(() => getDaySeed(userId), [userId]);
  const todayPassage = BROKER_PASSAGES[passageIndex];

  // Boot lines typed out
  const boot = useTypewriter(BOOT_TEXT, 14, 0, bootReady);
  // Passage typed out after boot completes
  const passage = useTypewriter(todayPassage, 16, 300, boot.done);

  // Timeline: 800ms wait → octopus fades in → 400ms → boot starts typing
  useEffect(() => {
    const t1 = setTimeout(() => setShowOctopus(true), 800);
    const t2 = setTimeout(() => setBootReady(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Once passage is done typing, show everything below
  useEffect(() => {
    if (passage.done) setAllReady(true);
  }, [passage.done]);

  // Show rest immediately once boot is done (don't wait for full passage)
  useEffect(() => {
    if (boot.done) {
      const t = setTimeout(() => setAllReady(true), 500);
      return () => clearTimeout(t);
    }
  }, [boot.done]);

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
    <div style={{ padding: "0 0 80px", minHeight: "100vh", background: "#050505", position: "relative" }}>
      {/* Scanlines */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(51,204,102,0.15) 2px, rgba(51,204,102,0.15) 4px)" }} />

      <div style={{ position: "relative", zIndex: 1, background: TBG, minHeight: "100vh", padding: "20px 18px 40px" }}>

        {/* ═══ MARKETPLACE HEADING — distinguished ═══ */}
        <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 16 }}>
          <div style={{ width: "60%", height: 1, background: `${T}22`, margin: "0 auto 14px" }} />
          <div style={{
            fontFamily: MONO, fontSize: 18, fontWeight: 700, color: T,
            letterSpacing: 4, textTransform: "uppercase",
          }}>Marketplace</div>
          <div style={{ width: "60%", height: 1, background: `${T}22`, margin: "14px auto 0" }} />
        </div>

        {/* ═══ OCTOPUS SIGIL — delayed fade in ═══ */}
        <div style={{ textAlign: "center", marginBottom: 20, minHeight: 140 }}>
          {showOctopus && (
            imgError ? (
              <div style={{ fontSize: 48, opacity: 0.5, animation: "fadeIn 0.6s ease" }}>{"\u{1F419}"}</div>
            ) : (
              <img src="/market-octopus.png" alt="The Broker" onError={() => setImgError(true)}
                style={{ width: 140, height: 140, objectFit: "contain", opacity: 0.85, animation: "fadeIn 0.6s ease" }} />
            )
          )}
        </div>

        {/* ═══ BOOT LINES — typed out as one block ═══ */}
        {bootReady && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: TD, lineHeight: 1.9, whiteSpace: "pre-wrap", marginBottom: 8 }}>
            {boot.displayed.split('\n').map((line, i) => {
              // Color the broker's name line brighter
              const isBrokerLine = line.includes('_the_broker_');
              return (
                <div key={i} style={{
                  color: isBrokerLine ? T : TD,
                  fontWeight: isBrokerLine ? 700 : 400,
                }}>{line}</div>
              );
            })}
            {!boot.done && <span style={{ color: TD, animation: "pulse 0.8s ease infinite" }}>{"\u2588"}</span>}
          </div>
        )}

        {/* ═══ PASSAGE — typed in bright green after boot ═══ */}
        {boot.done && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: T, fontWeight: 600, lineHeight: 1.9, whiteSpace: "pre-wrap", marginBottom: 28 }}>
            <span>{passage.displayed}</span>
            {!passage.done && <span style={{ animation: "pulse 0.8s ease infinite" }}>{"\u2588"}</span>}
          </div>
        )}

        {/* ═══ EVERYTHING BELOW — appears after boot completes ═══ */}
        {allReady && (
          <>
            {/* ═══ HIT THE SLOTS ═══ */}
            <div style={{ fontFamily: MONO, fontSize: 11, color: T, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>{"> hit_the_slots()"}</div>
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

            {/* ═══ THIS WEEK'S SUPPLY ═══ */}
            <div style={{ fontFamily: MONO, fontSize: 11, color: T, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>{"> this_weeks_supply()"}</div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${TD}22` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: TD, letterSpacing: 1 }}>{"> refreshes: monday"}</div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: isFull ? "#ef4444" : inventory.length >= inventoryCap * 0.8 ? "#f59e0b" : TD }}>[{inventory.length}/{inventoryCap}]</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: T }}>[{playerGold}g]</span>
              </div>
            </div>

            {weeklyStock.length === 0 ? (
              <div style={{ fontFamily: MONO, fontSize: 12, color: TD, padding: "16px 0" }}>{"> stock depleted. come back monday."}</div>
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

            <div style={{ height: 12 }} />
            <div style={{ fontFamily: MONO, fontSize: 10, color: TD }}>{"> end_of_transmission"}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: TD, marginTop: 4, animation: "pulse 1.5s ease infinite" }}>{"\u2588"}</div>
          </>
        )}
      </div>

      {/* ═══ SLOT MACHINE MODAL ═══ */}
      {(slotSpinning || slotResult) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!slotResult ? (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: TD, letterSpacing: 1, marginBottom: 24 }}>{"> processing transaction..."}</div>
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
                  {slotPhase === 'spinning' && "[ spinning... ]"}
                  {slotPhase === 'locking' && `[ ${locked.filter(Boolean).length}/3 locked ]`}
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: TD, letterSpacing: 1, marginBottom: 16 }}>{"> transaction complete"}</div>
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
                    <div style={{ fontFamily: MONO, fontSize: 10, color: TD, marginBottom: 12 }}>{"> item acquired"}</div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{SLOTS[slotResult.item.slot].emoji}</div>
                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: RARITIES[slotResult.item.rarity].color, marginBottom: 4 }}>{slotResult.item.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: RARITIES[slotResult.item.rarity].color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>{RARITIES[slotResult.item.rarity].label} {SLOTS[slotResult.item.slot].label}</div>
                  </>
                ) : (
                  <div style={{ fontFamily: MONO, fontSize: 11, color: TD, marginBottom: 20, marginTop: 8 }}>{"> no item. better luck next time."}</div>
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
              <div style={{ fontFamily: MONO, fontSize: 10, color: TD, letterSpacing: 1, marginBottom: 14 }}>{"> inspect_item()"}</div>
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