import { useState, useEffect } from 'react';
import { C, CLASSES, getRank } from '../constants';
import { CHEST_TYPES, rollChest } from '../chestSystem';

const MONO = "'Courier New', 'Consolas', monospace";

const PROTOCOLS = [
  { name: "Bodyweight Workout", label: "Forge the Body", code: "FORGE", icon: "/icon-forge.png", accent: "#e8922d", mentor: "Marcus" },
  { name: "Walk/Jog 20min", label: "Explore the Land", code: "RECON", icon: "/icon-recon.png", accent: "#4eba6f", mentor: "Kaya" },
  { name: "Read 20min", label: "Sharpen the Mind", code: "INTEL", icon: "/icon-intel.png", accent: "#5b9bd5", mentor: "Aldric" },
  { name: "Pray/Meditate 10min", label: "Still the Spirit", code: "SANCTUM", icon: "/icon-sanctum.png", accent: "#9b6dcc", mentor: "Khalil" },
  { name: "Reach Out", label: "Rally Your Allies", code: "SIGNAL", icon: "/icon-signal.png", accent: "#dbb85c", mentor: "Lucien" },
];

const SLOT_SYMBOLS = ['#', '$', '7', '%', '&', '@', '!', '*', '+', '='];

function useSlotMachine(spinning) {
  const [reels, setReels] = useState(['#', '#', '#']);
  const [locked, setLocked] = useState([false, false, false]);
  const [phase, setPhase] = useState('idle');
  useEffect(() => {
    if (!spinning) { setPhase('idle'); setLocked([false, false, false]); return; }
    setPhase('spinning'); setLocked([false, false, false]);
    const spinIv = setInterval(() => {
      setReels(prev => prev.map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]));
    }, 60);
    const t1 = setTimeout(() => { setReels(prev => ['?', prev[1], prev[2]]); setLocked([true, false, false]); setPhase('locking'); }, 800);
    const t2 = setTimeout(() => { setReels(prev => [prev[0], '?', prev[2]]); setLocked([true, true, false]); }, 1400);
    const t3 = setTimeout(() => {
      const finalSym = ['#', '$', '7'][Math.floor(Math.random() * 3)];
      setReels(prev => [prev[0], prev[1], finalSym]); setLocked([true, true, true]); setPhase('done');
    }, 2000);
    return () => { clearInterval(spinIv); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [spinning]);
  return { reels, locked, phase };
}

function getDaySeed(userId = "") {
  return (new Date().toISOString().split("T")[0] + userId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

export default function QuestsScreen({ onOpenRitual, completedRituals = {}, playerClass = "warrior", playerLevel = 1, ritualStreaks = {}, weeklyRitualCounts = {}, todayMeditation = null, meditationComplete = false, meditationTitle = "", onOpenMeditation, userId = "", onClaimWeekly, claimedWeeklies = [], inventory = [] }) {
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const completedCount = PROTOCOLS.filter(p => !!completedRituals[p.name]).length;
  const allDone = completedCount === 5;

  const weeklyQuests = [
    { id: "forge_weekly", name: "Forge the Body", desc: "Complete 4x this week", progress: weeklyRitualCounts["Bodyweight Workout"] || 0, target: 4, accent: "#e8922d" },
    { id: "intel_weekly", name: "Sharpen the Mind", desc: "Complete 5x this week", progress: weeklyRitualCounts["Read 20min"] || 0, target: 5, accent: "#5b9bd5" },
    { id: "signal_weekly", name: "Rally Your Allies", desc: "Complete 5x this week", progress: weeklyRitualCounts["Reach Out"] || 0, target: 5, accent: "#dbb85c" },
  ];

  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotResult, setSlotResult] = useState(null);
  const [claimingQuest, setClaimingQuest] = useState(null);
  const { reels, locked, phase: slotPhase } = useSlotMachine(slotSpinning);

  const handleClaimChest = (questId) => {
    if (slotSpinning || claimedWeeklies.includes(questId)) return;
    setClaimingQuest(questId);
    setSlotSpinning(true);
    setSlotResult(null);
    const result = rollChest(CHEST_TYPES.mystery, playerLevel, inventory);
    setTimeout(() => {
      setSlotSpinning(false);
      setSlotResult(result);
      onClaimWeekly?.(questId, result);
    }, 2200);
  };

  return (
    <div style={{ padding: "16px 18px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease", position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Level {playerLevel} {cls.title}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" }}>{rank}</div>
          </div>
          <div style={{
            fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: 1,
            color: allDone ? C.green : C.textDim,
          }}>{allDone ? "OPERATIONAL" : `${completedCount}/5`}</div>
        </div>

        {/* ═══ MEDITATION BANNER ═══ */}
        {meditationComplete && meditationTitle && (
          <div style={{
            padding: "14px 18px", marginTop: 10, marginBottom: 14, borderRadius: 12,
            background: C.blueFaint, borderLeft: `3px solid ${C.blue}`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.blue, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Today's Meditation</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 600, color: C.text, fontStyle: "italic" }}>"{meditationTitle}"</div>
          </div>
        )}

        {/* ═══ READINESS BAR ═══ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, marginBottom: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", flexShrink: 0 }}>Readiness</div>
          <div style={{ flex: 1, height: 3, background: C.surfaceLight, overflow: "hidden", borderRadius: 2 }}>
            <div style={{ width: `${(completedCount / 5) * 100}%`, height: "100%", background: allDone ? C.green : C.gold, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {PROTOCOLS.map((p, i) => {
              const done = !!completedRituals[p.name];
              return (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: 2,
                  background: done ? p.accent : C.surfaceLight,
                  transition: "background 0.3s ease",
                }} />
              );
            })}
          </div>
        </div>

        {/* ═══ DAILY MEDITATION ═══ */}
        {todayMeditation && !meditationComplete && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.blue, whiteSpace: "nowrap" }}>Daily Meditation</span>
              <div style={{ flex: 1, height: 1, background: `${C.blue}33` }} />
            </div>
            <div
              onClick={() => onOpenMeditation?.()}
              style={{
                padding: "16px 18px", cursor: "pointer",
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 12, transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{todayMeditation.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{todayMeditation.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{todayMeditation.prompt}</div>
                </div>
                <div style={{ padding: "6px 18px", background: C.blue, color: "#fff", fontFamily: MONO, fontSize: 11, fontWeight: 600 }}>Start</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PROTOCOLS ═══ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.text, whiteSpace: "nowrap" }}>Protocols</span>
            <div style={{ flex: 1, height: 1, background: `${C.text}15` }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PROTOCOLS.map((p, i) => {
              const done = !!completedRituals[p.name];
              const streak = ritualStreaks[p.name] || 0;
              return (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: done ? C.greenFaint : `${p.accent}0d`,
                  borderLeft: `3px solid ${done ? C.green + "66" : p.accent}`,
                  border: `1px solid ${done ? C.green + "22" : p.accent + "20"}`,
                  borderLeftWidth: 3,
                  opacity: done ? 0.45 : 1,
                  transition: "all 0.3s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: p.accent, letterSpacing: 1, fontWeight: 600 }}>{p.code}</span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: done ? C.textDim : C.text }}>{p.label}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {streak > 0 && (
                        <span style={{ fontFamily: MONO, fontSize: 11, color: C.gold, fontWeight: 600 }}>{streak}d</span>
                      )}
                      {done ? (
                        <span style={{ color: C.green, fontSize: 16 }}>{"\u2713"}</span>
                      ) : (
                        <button onClick={() => onOpenRitual({ name: p.name, label: p.label })} style={{
                          padding: "6px 18px", border: "none", cursor: "pointer",
                          background: p.accent, color: "#fff", fontFamily: MONO, fontSize: 11, fontWeight: 600,
                          borderRadius: 0, letterSpacing: 0.5,
                        }}>Start</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ WEEKLY CONTRACTS ═══ */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.purple, whiteSpace: "nowrap" }}>Weekly Contracts</span>
            <div style={{ flex: 1, height: 1, background: `${C.purple}33` }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {weeklyQuests.map((q, i) => {
              const done = q.progress >= q.target;
              const claimed = claimedWeeklies.includes(q.id);
              const pct = Math.min((q.progress / q.target) * 100, 100);
              return (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: done ? (claimed ? C.greenFaint : `${q.accent}0d`) : C.surface,
                  border: `1px solid ${done ? (claimed ? C.green + "33" : q.accent + "33") : C.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: done ? (claimed ? C.green : C.text) : C.text }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{q.desc}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {done && !claimed && (
                        <div onClick={() => handleClaimChest(q.id)} style={{ cursor: "pointer" }}>
                          <img src="/slot-gold.png" alt="chest" style={{ width: 32, height: 32, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
                        </div>
                      )}
                      {claimed && <span style={{ color: C.green, fontSize: 14 }}>{"\u2713"}</span>}
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: done ? C.green : C.textMuted }}>{q.progress}/{q.target}</span>
                    </div>
                  </div>
                  <div style={{ height: 3, background: C.surfaceLight, overflow: "hidden", borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: done ? C.green : q.accent, transition: "width 0.5s ease", borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, letterSpacing: 1, marginBottom: 16 }}>{"> reward claimed"}</div>
                <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.gold, marginBottom: 8 }}>+{slotResult.gold}g</div>
                {slotResult.item ? (
                  <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: C.green, marginBottom: 20 }}>{slotResult.item.name}</div>
                ) : (
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, marginBottom: 20 }}>Gold only this time.</div>
                )}
                <button onClick={() => { setSlotResult(null); setClaimingQuest(null); }} style={{
                  padding: "12px 40px", border: `1px solid ${C.gold}55`, cursor: "pointer",
                  background: "transparent", fontFamily: MONO, color: C.gold, fontSize: 13, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
                }}>[ OK ]</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}