import { useState, useEffect } from 'react';
import { C, CLASSES, getRank } from '../constants';
import { CHEST_TYPES, rollChest } from '../chestSystem';

const MONO = "'Courier New', 'Consolas', monospace";
const CINZEL = "'Cinzel', serif";
const GOLD_BORDER = `2px solid ${C.goldDark || '#8b6f2a'}`;
const CARD = {
  border: GOLD_BORDER,
  borderRadius: 12,
  boxShadow: `inset 0 1px 0 rgba(232,212,139,0.15), 0 2px 8px rgba(0,0,0,0.5)`,
};

const PROTOCOLS = [
  { name: "Bodyweight Workout", label: "Forge the Body", code: "FORGE", icon: "/icon-forge.png", accent: "#d4782a", bg: "linear-gradient(135deg, #3a2818 0%, #4a3520 50%, #3a2818 100%)" },
  { name: "Walk/Jog 20min", label: "Explore the Land", code: "RECON", icon: "/icon-recon.png", accent: "#3ab888", bg: "linear-gradient(135deg, #1a2e22 0%, #253a2e 50%, #1a2e22 100%)" },
  { name: "Read 20min", label: "Sharpen the Mind", code: "INTEL", icon: "/icon-intel.png", accent: "#3ab0d4", bg: "linear-gradient(135deg, #1a2535 0%, #253545 50%, #1a2535 100%)" },
  { name: "Pray/Meditate 10min", label: "Still the Spirit", code: "SANCTUM", icon: "/icon-sanctum.png", accent: "#9b6dcc", bg: "linear-gradient(135deg, #251a30 0%, #352a45 50%, #251a30 100%)" },
  { name: "Reach Out", label: "Rally Your Allies", code: "SIGNAL", icon: "/icon-signal.png", accent: "#c9a84c", bg: "linear-gradient(135deg, #2a2210 0%, #3a3020 50%, #2a2210 100%)" },
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
    const t1 = setTimeout(() => { setReels(['?', '?', '?']); setLocked([true, false, false]); setPhase('locking'); }, 800);
    const t2 = setTimeout(() => { setLocked([true, true, false]); }, 1400);
    const t3 = setTimeout(() => {
      setReels(['#', '$', '7']); setLocked([true, true, true]); setPhase('done');
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
    { id: "forge_weekly", name: "Forge the Body", desc: "Complete 4x this week", progress: weeklyRitualCounts["Bodyweight Workout"] || 0, target: 4, accent: "#d4782a" },
    { id: "intel_weekly", name: "Sharpen the Mind", desc: "Complete 5x this week", progress: weeklyRitualCounts["Read 20min"] || 0, target: 5, accent: "#3ab0d4" },
    { id: "signal_weekly", name: "Rally Your Allies", desc: "Complete 5x this week", progress: weeklyRitualCounts["Reach Out"] || 0, target: 5, accent: "#c9a84c" },
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
    setTimeout(() => { setSlotSpinning(false); setSlotResult(result); onClaimWeekly?.(questId, result); }, 2200);
  };

  return (
    <div style={{ padding: "16px 14px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease", position: "relative" }}>
      {/* Warm ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)` }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ═══ HEADER BADGE ═══ */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            ...CARD, display: "inline-block", padding: "12px 32px",
            background: `linear-gradient(135deg, #2a2018, #3a3020, #2a2018)`,
            position: "relative",
          }}>
            <div style={{ fontFamily: CINZEL, fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: 2, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              Level {playerLevel} {cls.title}
            </div>
            <div style={{ fontFamily: CINZEL, fontSize: 11, fontWeight: 600, color: C.goldLight || C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
              {rank}
            </div>
          </div>
        </div>

        {/* ═══ READINESS PIPS ═══ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontFamily: CINZEL, fontSize: 10, color: C.goldLight || C.gold, letterSpacing: 2, fontWeight: 600 }}>READINESS</span>
          {PROTOCOLS.map((p, i) => {
            const done = !!completedRituals[p.name];
            return (
              <div key={i} style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${C.goldDark || '#8b6f2a'}`,
                background: done
                  ? `radial-gradient(circle at 40% 35%, ${C.goldLight || '#e8d48b'}, ${C.gold})`
                  : C.bg,
                boxShadow: done ? `0 0 6px ${C.gold}60` : `inset 0 1px 3px rgba(0,0,0,0.5)`,
                transition: "all 0.3s ease",
              }} />
            );
          })}
          <span style={{ fontFamily: CINZEL, fontSize: 11, color: allDone ? C.green : C.textDim, fontWeight: 600 }}>
            {allDone ? "OPERATIONAL" : `${completedCount}/5`}
          </span>
        </div>

        {/* ═══ DAILY MEDITATION ═══ */}
        {todayMeditation && !meditationComplete && (
          <div style={{ marginBottom: 18 }}>
            <div
              onClick={() => onOpenMeditation?.()}
              style={{
                ...CARD, padding: "14px 16px", cursor: "pointer",
                background: `linear-gradient(135deg, rgba(240,228,200,0.06), rgba(240,228,200,0.02))`,
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <span style={{ fontSize: 22 }}>{todayMeditation.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: CINZEL, fontSize: 10, fontWeight: 700, color: C.goldLight || C.gold, letterSpacing: 1.5, marginBottom: 2 }}>DAILY MEDITATION</div>
                <div style={{ fontFamily: CINZEL, fontSize: 14, fontWeight: 700, color: C.text }}>{todayMeditation.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{todayMeditation.prompt}</div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `2px solid ${C.goldDark || '#8b6f2a'}`,
                background: `radial-gradient(circle at 35% 35%, #5b9bd5cc, #5b9bd580 60%, #5b9bd540)`,
                boxShadow: `0 0 12px rgba(91,155,213,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontFamily: CINZEL, fontWeight: 700, color: "#fff",
              }}>Go</div>
            </div>
          </div>
        )}

        {meditationComplete && meditationTitle && (
          <div style={{ ...CARD, padding: "12px 16px", marginBottom: 18, background: `linear-gradient(135deg, rgba(78,186,111,0.08), rgba(78,186,111,0.02))` }}>
            <div style={{ fontFamily: CINZEL, fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 1.5, marginBottom: 2 }}>TODAY'S MEDITATION</div>
            <div style={{ fontFamily: CINZEL, fontSize: 14, fontWeight: 600, color: C.text, fontStyle: "italic" }}>"{meditationTitle}"</div>
          </div>
        )}

        {/* ═══ SECTION: PROTOCOLS ═══ */}
        <div style={{ fontFamily: CINZEL, fontSize: 12, fontWeight: 700, color: C.goldLight || C.gold, letterSpacing: 3, textAlign: "center", marginBottom: 12 }}>
          PROTOCOLS
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {PROTOCOLS.map((p, i) => {
            const done = !!completedRituals[p.name];
            const streak = ritualStreaks[p.name] || 0;
            return (
              <div key={i} style={{
                ...CARD, padding: "14px 16px",
                background: done ? `linear-gradient(135deg, rgba(78,186,111,0.08), rgba(78,186,111,0.03))` : p.bg,
                opacity: done ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: 14,
                position: "relative", overflow: "hidden",
              }}>
                {/* Subtle cross-hatch pattern */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0v20M0 10h20' stroke='%23ffffff' stroke-width='.5'/%3E%3C/svg%3E")`,
                }} />

                <img src={p.icon} alt={p.code} style={{ width: 36, height: 36, objectFit: "contain", filter: done ? "grayscale(1)" : "none", opacity: done ? 0.5 : 0.85, zIndex: 1 }} onError={e => { e.target.style.display = "none"; }} />

                <div style={{ flex: 1, zIndex: 1 }}>
                  <div style={{ fontFamily: CINZEL, fontSize: 16, fontWeight: 700, color: done ? C.textDim : "#fff", letterSpacing: 1.5, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    {p.code}
                  </div>
                  <div style={{ fontFamily: CINZEL, fontSize: 11, color: done ? C.textDim : "rgba(255,255,255,0.7)", letterSpacing: 1 }}>
                    {p.label}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
                  {streak > 0 && <span style={{ fontFamily: MONO, fontSize: 11, color: C.gold, fontWeight: 600 }}>{streak}d</span>}
                  {done ? (
                    <span style={{ color: C.green, fontSize: 18 }}>{"\u2713"}</span>
                  ) : (
                    <div onClick={() => onOpenRitual({ name: p.name, label: p.label })} style={{
                      width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
                      border: `2px solid ${C.goldDark || '#8b6f2a'}`,
                      background: `radial-gradient(circle at 35% 35%, ${p.accent}cc, ${p.accent}80 60%, ${p.accent}40)`,
                      boxShadow: `0 0 12px ${p.accent}40, inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px ${p.accent}60`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: CINZEL, fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 1,
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    }}>Start</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ SECTION: WEEKLY ═══ */}
        <div style={{ fontFamily: CINZEL, fontSize: 12, fontWeight: 700, color: C.purple, letterSpacing: 3, textAlign: "center", marginBottom: 12 }}>
          WEEKLY CONTRACTS
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {weeklyQuests.map((q, i) => {
            const done = q.progress >= q.target;
            const claimed = claimedWeeklies.includes(q.id);
            const pct = Math.min((q.progress / q.target) * 100, 100);
            return (
              <div key={i} style={{
                ...CARD, padding: "14px 16px",
                background: done ? (claimed ? `linear-gradient(135deg, rgba(78,186,111,0.06), rgba(78,186,111,0.02))` : `${q.accent}0a`) : `linear-gradient(135deg, ${C.surface}, ${C.surfaceLight})`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: CINZEL, fontSize: 13, fontWeight: 700, color: done ? (claimed ? C.green : C.text) : C.text }}>{q.name}</div>
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
                <div style={{ height: 10, borderRadius: 5, background: C.bg, border: `1px solid ${C.goldDark || '#8b6f2a'}`, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${done ? C.green : q.accent}90, ${done ? C.green : q.accent})`, boxShadow: `0 0 6px ${done ? C.green : q.accent}40, inset 0 1px 0 rgba(255,255,255,0.2)`, transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ SLOT MACHINE MODAL ═══ */}
      {(slotSpinning || slotResult) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,8,5,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
            {!slotResult ? (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ fontFamily: CINZEL, fontSize: 12, color: C.gold, letterSpacing: 2, marginBottom: 24 }}>OPENING CHEST...</div>
                <div style={{ ...CARD, display: "inline-block", padding: "20px 28px", background: C.surface }}>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                    {reels.map((sym, i) => (
                      <div key={i} style={{
                        width: 60, height: 72, display: "flex", alignItems: "center", justifyContent: "center",
                        border: `2px solid ${locked[i] ? C.gold : C.border}`, borderRadius: 8,
                        background: locked[i] ? C.goldFaint : C.bg, transition: "all 0.15s ease",
                      }}>
                        <span style={{ fontFamily: CINZEL, fontSize: 32, fontWeight: 700, color: locked[i] ? C.gold : C.textDim }}>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontFamily: CINZEL, fontSize: 14, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>REWARD</div>
                <div style={{ fontFamily: CINZEL, fontSize: 32, fontWeight: 700, color: C.goldLight || C.gold, marginBottom: 8, textShadow: `0 0 16px ${C.gold}60` }}>+{slotResult.gold}g</div>
                {slotResult.item ? (
                  <div style={{ fontFamily: CINZEL, fontSize: 14, fontWeight: 600, color: C.green, marginBottom: 20 }}>{slotResult.item.name}</div>
                ) : (
                  <div style={{ fontSize: 12, color: C.textDim, marginBottom: 20 }}>Gold only this time.</div>
                )}
                <button onClick={() => { setSlotResult(null); setClaimingQuest(null); }} style={{
                  ...CARD, padding: "10px 32px", cursor: "pointer",
                  background: `linear-gradient(135deg, ${C.goldDark || '#8b6f2a'}, #5c4a2a)`,
                  fontFamily: CINZEL, color: C.text, fontSize: 12, fontWeight: 700, letterSpacing: 2,
                }}>CONTINUE</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}