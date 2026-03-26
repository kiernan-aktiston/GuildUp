import { C, CLASSES, getRank } from '../constants';

export default function QuestsScreen({ onOpenRitual, completedRituals = {}, playerClass = "warrior", playerLevel = 1, ritualStreaks = {}, weeklyRitualCounts = {}, todayMeditation = null, meditationComplete = false, meditationTitle = "", onOpenMeditation }) {
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const rituals = [
    { name: "Bodyweight Workout", label: "Forge the Body", emoji: "\u2694\uFE0F", desc: "Train your strength." },
    { name: "Walk/Jog 20min", label: "Explore the Land", emoji: "\u{1F3F9}", desc: "Get outside. Walk or run." },
    { name: "Read 20min", label: "Sharpen the Mind", emoji: "\u{1F4D6}", desc: "Read. Prove you learned." },
    { name: "Pray/Meditate 10min", label: "Still the Spirit", emoji: "\u{1F56F}\uFE0F", desc: "Breathe. Be still." },
    { name: "Reach Out", label: "Rally Your Allies", emoji: "\u{1F5E1}\uFE0F", desc: "Reach out to one person." },
  ].map(r => ({ ...r, done: !!completedRituals[r.name] }));

  const streakKeys = [
    { emoji: "\u2694\uFE0F", name: "Bodyweight Workout" },
    { emoji: "\u{1F3F9}", name: "Walk/Jog 20min" },
    { emoji: "\u{1F4D6}", name: "Read 20min" },
    { emoji: "\u{1F56F}\uFE0F", name: "Pray/Meditate 10min" },
    { emoji: "\u{1F5E1}\uFE0F", name: "Reach Out" },
  ];

  const weeklyQuests = [
    { name: "Forge the Body", desc: "Complete 4x this week", progress: weeklyRitualCounts["Bodyweight Workout"] || 0, target: 4 },
    { name: "Sharpen the Mind", desc: "Complete 5x this week", progress: weeklyRitualCounts["Read 20min"] || 0, target: 5 },
    { name: "Rally Your Allies", desc: "Complete 5x this week", progress: weeklyRitualCounts["Reach Out"] || 0, target: 5 },
  ];

  const completedCount = rituals.filter(r => r.done).length;

  const SectionHeader = ({ children, color = C.gold }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{
        fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700,
        letterSpacing: 2.5, textTransform: "uppercase", color, whiteSpace: "nowrap",
      }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: `${color}22` }} />
    </div>
  );

  return (
    <div style={{
      padding: "16px 18px 120px", animation: "fadeIn 0.3s ease",
      minHeight: "100vh", position: "relative", background: C.bg,
    }}>

      {/* CSS-only background: radial warm glow + faint grid */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 20%, rgba(201, 168, 76, 0.04) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 30% 80%, rgba(74, 106, 148, 0.03) 0%, transparent 60%)
        `,
      }}>
        {/* Subtle grid pattern via repeating gradient */}
        <div style={{
          width: "100%", height: "100%", opacity: 0.025,
          backgroundImage: `
            linear-gradient(rgba(201, 168, 76, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14, paddingBottom: 14,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{cls.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Level {playerLevel} {cls.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>{rank}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.textDim }}>{completedCount}/5 today</div>
        </div>

        {/* Meditation banner */}
        {meditationComplete && meditationTitle && (
          <div style={{
            padding: "14px 18px", marginBottom: 14, borderRadius: 12,
            background: C.blueFaint, borderLeft: `3px solid ${C.blue}`,
          }}>
            <div style={{
              fontSize: 10, color: C.blue, fontWeight: 600, letterSpacing: 2,
              textTransform: "uppercase", marginBottom: 4,
            }}>Today's Meditation</div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 600,
              color: C.text, fontStyle: "italic",
            }}>"{meditationTitle}"</div>
          </div>
        )}

        {/* Streaks */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, padding: "0 2px",
        }}>
          <span style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Streaks</span>
          <div style={{ display: "flex", gap: 14 }}>
            {streakKeys.map((s, i) => {
              const count = ritualStreaks[s.name] || 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 13 }}>{s.emoji}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700, fontFamily: "monospace",
                    color: count > 0 ? C.gold : C.textDim,
                  }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Meditation */}
        {todayMeditation && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader color={C.blue}>Daily Meditation</SectionHeader>
            <div
              onClick={() => { if (!meditationComplete) onOpenMeditation?.(); }}
              style={{
                padding: "16px 18px", borderRadius: 12, cursor: meditationComplete ? "default" : "pointer",
                background: meditationComplete ? C.greenFaint : C.surface,
                border: `1px solid ${meditationComplete ? C.green + "33" : C.border}`,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22, opacity: meditationComplete ? 0.4 : 1 }}>{todayMeditation.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: meditationComplete ? C.textDim : C.text,
                  }}>{todayMeditation.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{todayMeditation.prompt}</div>
                </div>
                {meditationComplete ? (
                  <span style={{ color: C.green, fontSize: 18 }}>{"\u2713"}</span>
                ) : (
                  <div style={{
                    padding: "7px 18px", borderRadius: 20,
                    background: C.blue, color: "#fff",
                    fontSize: 13, fontWeight: 600,
                  }}>Reflect</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* The Five — Daily Rituals */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader color={C.green}>The Five</SectionHeader>
          <div>
            {rituals.map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 4px",
                borderBottom: i < rituals.length - 1 ? `1px solid ${C.border}` : "none",
                opacity: r.done ? 0.4 : 1,
                transition: "opacity 0.3s ease",
              }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 1 }}>{r.desc}</div>
                </div>
                {r.done ? (
                  <span style={{ color: C.green, fontSize: 18, flexShrink: 0 }}>{"\u2713"}</span>
                ) : (
                  <button onClick={() => onOpenRitual(r)} style={{
                    padding: "7px 20px", borderRadius: 20, border: "none", cursor: "pointer",
                    background: C.green, color: "#fff",
                    fontSize: 13, fontWeight: 600, flexShrink: 0,
                  }}>Start</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Quests */}
        <div>
          <SectionHeader color={C.purple}>Weekly</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weeklyQuests.map((q, i) => {
              const done = q.progress >= q.target;
              const pct = Math.min((q.progress / q.target) * 100, 100);
              return (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: done ? C.greenFaint : C.surface,
                  border: `1px solid ${done ? C.green + "33" : C.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: done ? C.green : C.text }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{q.desc}</div>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600, fontFamily: "monospace",
                      color: done ? C.green : C.textMuted,
                    }}>{q.progress}/{q.target}</span>
                  </div>
                  <div style={{ height: 3, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 2,
                      background: done ? C.green : C.purple,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}