import { useState, useEffect } from 'react';
import { C, CLASSES, getRank } from '../constants';
import { CHEST_TYPES, rollChest } from '../chestSystem';
import { SLOTS, RARITIES } from '../equipmentData';

const MONO = "'Courier New', 'Consolas', monospace";
const SLOT_SYMBOLS = ['#', '$', '7', '%', '&', '@', '!', '*', '+', '='];

// ═══════════════════════════════════════
// DAILY BRIEFINGS — from the guild system
// ═══════════════════════════════════════
const BRIEFINGS = [
  "Readiness is not optional. It is the price of belonging.",
  "Border activity reported in the eastern corridor. Maintain operational status.",
  "Three guilds were dissolved this quarter. All cited member attrition. Don't be next.",
  "Your guild's contract rating depends on every operator's daily output.",
  "No one remembers the guild that almost won the contract.",
  "Field conditions are deteriorating across all dominions. Sharpen everything.",
  "Intelligence reports indicate increased competition for Tier 2 contracts. Stay ready.",
  "The guild that trains hardest in peacetime survives the longest in conflict.",
  "A guild member who doesn't train is a liability with a name.",
  "Discipline is the only infrastructure that doesn't decay.",
  "Your readiness score is visible to guild leadership. Act accordingly.",
  "Two operators were reassigned last week for protocol noncompliance. Don't join them.",
  "The difference between a mercenary and a liability is consistency.",
  "Supply lines are thinning. Every resource you earn today matters more tomorrow.",
  "There are no days off. There are only days you chose not to show up.",
];

const PROTOCOLS = [
  {
    name: "Bodyweight Workout", label: "Forge the Body", code: "FORGE",
    icon: "/icon-forge.png", accent: "#c47a20",
    mentor: "Marcus",
    lines: [
      "Your body is the first tool. Maintain it or be replaced by someone who does.",
      "Suffering is just information. It tells you where you're weak. Listen.",
      "I don't care how you feel. I care if you showed up.",
      "The enemy trains on the days you rest. Remember that.",
      "Discipline weighs ounces. Regret weighs tons.",
      "You're not training to get strong. You're training to be useful.",
      "A dull blade is a dead operator. Sharpen yourself.",
    ],
  },
  {
    name: "Walk/Jog 20min", label: "Explore the Land", code: "RECON",
    icon: "/icon-recon.png", accent: "#5a7a5a",
    mentor: "Kaya",
    lines: [
      "You've walked this route a hundred times. Today, notice what changed.",
      "Every street is a supply line. Every alley is an exit. Learn them.",
      "The territory doesn't care about your map. Walk it. Know it.",
      "An operator who doesn't know the ground is already lost.",
      "Move through your city like it's hostile territory. Because someday it might be.",
      "Recon isn't exercise. It's survival intelligence gathered on foot.",
      "The land tells you things if you stop and listen. Start walking.",
    ],
  },
  {
    name: "Read 20min", label: "Sharpen the Mind", code: "INTEL",
    icon: "/icon-intel.png", accent: "#4a6a94",
    mentor: "Aldric",
    lines: [
      "Knowledge is the only weapon that gets sharper with use. Read.",
      "A book is a dead strategist's best argument. Find the flaw in it.",
      "The guild that hoards knowledge outlasts the guild that hoards gold.",
      "Twenty minutes of reading is twenty minutes of competitive advantage.",
      "What you read today becomes the decision you make under pressure tomorrow.",
      "Ignorance isn't neutral. It's a vulnerability your enemies will exploit.",
      "The scriptorium survived the collapse. Libraries outlast empires. Read.",
    ],
  },
  {
    name: "Pray/Meditate 10min", label: "Still the Spirit", code: "SANCTUM",
    icon: "/icon-sanctum.png", accent: "#6b4a8c",
    mentor: "Khalil",
    lines: [
      "You cannot think your way to peace. Stop thinking first.",
      "The desert fathers sat in silence for years. You have ten minutes.",
      "Stillness is not weakness. It is the deepest kind of readiness.",
      "An operator who cannot quiet the mind will break in the field.",
      "Sit. Breathe. The answers come when you stop chasing them.",
      "There is something larger than you. Acknowledge it. It changes everything.",
      "The spirit is the last thing to fail. Keep it sharp.",
    ],
  },
  {
    name: "Reach Out", label: "Rally Your Allies", code: "SIGNAL",
    icon: "/icon-signal.png", accent: "#c9a84c",
    mentor: "Lucien",
    lines: [
      "Your network is your guild's reach. An isolated operator is a dead one.",
      "One message. One contact. That's all it takes to stay visible.",
      "Silence is how you disappear. Send the message.",
      "Every relationship is infrastructure. Neglected infrastructure collapses.",
      "The best contract your guild ever wins will come through someone you know.",
      "Influence isn't charm. It's consistent, strategic presence. Be present.",
      "A guild of eight connected operators outperforms a guild of fifty strangers.",
    ],
  },
];

function getDaySeed(userId = "") {
  return (new Date().toISOString().split("T")[0] + userId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

// Slot machine hook
function useSlotMachine(spinning) {
  const [reels, setReels] = useState(['#', '#', '#']);
  const [locked, setLocked] = useState([false, false, false]);
  const [phase, setPhase] = useState('idle');
  useEffect(() => {
    if (!spinning) { setPhase('idle'); setLocked([false, false, false]); return; }
    setPhase('spinning'); setLocked([false, false, false]);
    const sym = '?';
    const spinIv = setInterval(() => {
      setReels(() => SLOT_SYMBOLS.sort(() => Math.random() - 0.5).slice(0, 3));
    }, 60);
    const t1 = setTimeout(() => { setReels(prev => [sym, prev[1], prev[2]]); setLocked([true, false, false]); setPhase('locking'); }, 800);
    const t2 = setTimeout(() => { setReels(prev => [prev[0], sym, prev[2]]); setLocked([true, true, false]); }, 1400);
    const t3 = setTimeout(() => {
      const finalSym = ['#', '$', '7'][Math.floor(Math.random() * 3)];
      setReels(prev => [prev[0], prev[1], finalSym]); setLocked([true, true, true]); setPhase('done');
    }, 2000);
    return () => { clearInterval(spinIv); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [spinning]);
  return { reels, locked, phase };
}

export default function QuestsScreen({ onOpenRitual, completedRituals = {}, playerClass = "warrior", playerLevel = 1, ritualStreaks = {}, weeklyRitualCounts = {}, todayMeditation = null, meditationComplete = false, meditationTitle = "", onOpenMeditation, userId = "", onClaimWeekly, claimedWeeklies = [], inventory = [] }) {
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const seed = getDaySeed(userId);
  const completedCount = PROTOCOLS.filter(p => !!completedRituals[p.name]).length;
  const allDone = completedCount === 5;

  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotQuestId, setSlotQuestId] = useState(null);
  const [slotResult, setSlotResult] = useState(null);
  const { reels, locked, phase: slotPhase } = useSlotMachine(slotSpinning);

  const briefing = BRIEFINGS[seed % BRIEFINGS.length];

  const weeklyQuests = [
    { id: "forge_weekly", name: "Forge the Body", desc: "Complete 4x this week", progress: weeklyRitualCounts["Bodyweight Workout"] || 0, target: 4 },
    { id: "intel_weekly", name: "Sharpen the Mind", desc: "Complete 5x this week", progress: weeklyRitualCounts["Read 20min"] || 0, target: 5 },
    { id: "signal_weekly", name: "Rally Your Allies", desc: "Complete 5x this week", progress: weeklyRitualCounts["Reach Out"] || 0, target: 5 },
  ];

  const handleClaimChest = (questId) => {
    const result = rollChest(CHEST_TYPES.mystery, playerLevel, inventory);
    setSlotQuestId(questId);
    setSlotSpinning(true);
    setSlotResult(null);
    // After spin completes, show result
    setTimeout(() => {
      setSlotSpinning(false);
      setSlotResult(result);
      onClaimWeekly?.(questId, result);
    }, 2200);
  };

  const T = "#f59e0b";
  const TD = "#92700a";

  return (
    <div style={{ padding: "16px 18px 100px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease", position: "relative" }}>

      {/* Hex grid command-table wallpaper */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 0,
        backgroundImage: "url(/ops-bg.png)", backgroundSize: "cover", backgroundPosition: "center top",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{cls.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Level {playerLevel} {cls.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>{rank}</div>
            </div>
          </div>
          <div style={{
            fontFamily: "monospace", fontSize: 11, fontWeight: 600, letterSpacing: 1,
            color: allDone ? C.green : C.textDim,
          }}>{allDone ? "OPERATIONAL" : `${completedCount}/5`}</div>
        </div>

        {/* ═══ DAILY BRIEFING ═══ */}
        <div style={{
          padding: "12px 14px", marginTop: 10, marginBottom: 16,
          background: C.goldFaint, borderLeft: `3px solid ${C.gold}33`,
        }}>
          <div style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>
            DAILY BRIEFING {"\u2014"} {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{briefing}</div>
        </div>

        {/* ═══ MEDITATION BANNER ═══ */}
        {meditationComplete && meditationTitle && (
          <div style={{
            padding: "14px 18px", marginBottom: 14,
            background: C.blueFaint, borderLeft: `3px solid ${C.blue}`,
          }}>
            <div style={{ fontSize: 10, color: C.blue, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Today's Meditation</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 600, color: C.text, fontStyle: "italic" }}>"{meditationTitle}"</div>
          </div>
        )}

        {/* ═══ READINESS BAR ═══ */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", flexShrink: 0 }}>Readiness</div>
          <div style={{ flex: 1, height: 3, background: C.surfaceLight, overflow: "hidden" }}>
            <div style={{ width: `${(completedCount / 5) * 100}%`, height: "100%", background: allDone ? C.green : C.gold, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PROTOCOLS.map((p, i) => {
              const done = !!completedRituals[p.name];
              return (
                <div key={i} style={{
                  width: 8, height: 8,
                  background: done ? p.accent : C.surfaceLight,
                  transition: "background 0.3s ease",
                }} />
              );
            })}
          </div>
        </div>

        {/* ═══ DAILY MEDITATION ═══ */}
        {todayMeditation && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.blue, whiteSpace: "nowrap" }}>Daily Meditation</span>
              <div style={{ flex: 1, height: 1, background: `${C.blue}22` }} />
            </div>
            <div
              onClick={() => { if (!meditationComplete) onOpenMeditation?.(); }}
              style={{
                padding: "16px 18px", cursor: meditationComplete ? "default" : "pointer",
                background: meditationComplete ? C.greenFaint : C.surface,
                border: `1px solid ${meditationComplete ? C.green + "33" : C.border}`,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22, opacity: meditationComplete ? 0.4 : 1 }}>{todayMeditation.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: meditationComplete ? C.textDim : C.text }}>{todayMeditation.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{todayMeditation.prompt}</div>
                </div>
                {meditationComplete ? (
                  <span style={{ color: C.green, fontSize: 18 }}>{"\u2713"}</span>
                ) : (
                  <div style={{ padding: "7px 18px", borderRadius: 20, background: C.blue, color: "#fff", fontSize: 13, fontWeight: 600 }}>Reflect</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ PROTOCOLS ═══ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.text, whiteSpace: "nowrap" }}>Protocols</span>
            <div style={{ flex: 1, height: 1, background: `${C.text}11` }} />
          </div>

          <div>
            {PROTOCOLS.map((p, i) => {
              const done = !!completedRituals[p.name];
              const streak = ritualStreaks[p.name] || 0;
              return (
                <div key={i} style={{
                  padding: "14px 16px", marginBottom: 10,
                  background: done
                    ? C.greenFaint
                    : `linear-gradient(135deg, ${p.accent}22 0%, ${C.surface} 70%)`,
                  borderLeft: `3px solid ${done ? C.green + "66" : p.accent}`,
                  border: `1px solid ${done ? C.green + "22" : p.accent + "33"}`,
                  borderLeftWidth: 3,
                  opacity: done ? 0.4 : 1,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {!done && (
                    <img src={p.icon} alt="" style={{
                      position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                      width: 80, height: 80, objectFit: "contain",
                      opacity: 0.08, pointerEvents: "none",
                    }} onError={e => { e.target.style.display = "none"; }} />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
                    <img src={p.icon} alt={p.code} style={{
                      width: 44, height: 44, objectFit: "contain", flexShrink: 0,
                      opacity: done ? 0.3 : 1,
                    }} onError={e => { e.target.style.display = "none"; }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: p.accent, letterSpacing: 1.5, marginBottom: 2, opacity: 0.7 }}>{p.code}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: done ? C.textDim : C.text }}>{p.label}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {streak > 0 && (
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: C.gold, fontWeight: 700 }}>{streak}d</span>
                      )}
                      {done ? (
                        <span style={{ color: C.green, fontSize: 18 }}>{"\u2713"}</span>
                      ) : (
                        <button onClick={() => onOpenRitual({ name: p.name, label: p.label })} style={{
                          padding: "8px 22px", borderRadius: 20, border: "none", cursor: "pointer",
                          background: p.accent, color: "#fff", fontSize: 13, fontWeight: 600,
                          boxShadow: `0 2px 12px ${p.accent}33`,
                        }}>Start</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ WEEKLY ═══ */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.purple, whiteSpace: "nowrap" }}>Weekly</span>
            <div style={{ flex: 1, height: 1, background: `${C.purple}22` }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weeklyQuests.map((q, i) => {
              const done = q.progress >= q.target;
              const claimed = claimedWeeklies.includes(q.id);
              const pct = Math.min((q.progress / q.target) * 100, 100);
              return (
                <div key={i} style={{
                  padding: "14px 16px",
                  background: claimed ? C.greenFaint : done ? "rgba(245, 158, 11, 0.06)" : C.surface,
                  border: `1px solid ${claimed ? C.green + "33" : done ? "#f59e0b33" : C.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: claimed ? C.green : done ? "#f59e0b" : C.text }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{q.desc}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Chest icon — always visible */}
                      <div onClick={() => { if (done && !claimed) handleClaimChest(q.id); }} style={{ cursor: done && !claimed ? "pointer" : "default" }}>
                        <img src="/slot-gold.png" alt="chest" style={{
                          width: 36, height: 36, objectFit: "contain",
                          filter: done && !claimed ? "none" : claimed ? "grayscale(100%) brightness(0.3)" : "grayscale(100%) brightness(0.3)",
                          opacity: done && !claimed ? 1 : claimed ? 0.25 : 0.35,
                          transition: "all 0.3s ease",
                        }} onError={e => { e.target.style.display = "none"; }} />
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: claimed ? C.green : done ? "#f59e0b" : C.textMuted, minWidth: 30, textAlign: "right" }}>
                        {claimed ? "\u2713" : `${q.progress}/${q.target}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 3, background: C.surfaceLight, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: claimed ? C.green : done ? "#f59e0b" : C.purple, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ SLOT MACHINE MODAL ═══ */}
      {(slotSpinning || slotResult) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!slotResult ? (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: TD, letterSpacing: 1, marginBottom: 24 }}>{">> weekly reward processing..."}</div>
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
                <div style={{ fontFamily: MONO, fontSize: 11, color: TD, letterSpacing: 1, marginBottom: 16 }}>{">> weekly reward claimed"}</div>
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
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{SLOTS[slotResult.item.slot]?.emoji || "\u{1F392}"}</div>
                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: RARITIES[slotResult.item.rarity]?.color || C.text, marginBottom: 4 }}>{slotResult.item.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: RARITIES[slotResult.item.rarity]?.color || C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>{RARITIES[slotResult.item.rarity]?.label} {SLOTS[slotResult.item.slot]?.label}</div>
                  </>
                ) : (
                  <div style={{ fontFamily: MONO, fontSize: 11, color: TD, marginBottom: 20, marginTop: 8 }}>{">> gold only. better luck next time."}</div>
                )}
                <button onClick={() => { setSlotResult(null); setSlotQuestId(null); }} style={{
                  padding: "12px 40px", border: `1px solid ${T}55`, cursor: "pointer",
                  background: "transparent", fontFamily: MONO, color: T, fontSize: 13, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
                }}>[ OK ]</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}