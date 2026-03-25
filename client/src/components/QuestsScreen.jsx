import { C, CLASSES, getRank } from '../constants';

export default function QuestsScreen({ onOpenRitual, completedRituals = {}, playerClass = "warrior", playerLevel = 1, ritualStreaks = {}, weeklyRitualCounts = {}, todayMeditation = null, meditationComplete = false, meditationTitle = "", onOpenMeditation }) {
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const rituals = [
    { name: "Bodyweight Workout", label: "Forge the Body", emoji: "\u2694\uFE0F", desc: "Bodyweight exercises to strengthen the body and build consistency." },
    { name: "Walk/Jog 20min", label: "Explore the Land", emoji: "\u{1F3F9}", desc: "Get outside. Walk or run. Clear your mind, build endurance." },
    { name: "Read 20min", label: "Sharpen the Mind", emoji: "\u{1F4D6}", desc: "Knowledge compounds. Read an article, prove you learned." },
    { name: "Pray/Meditate 10min", label: "Still the Spirit", emoji: "\u{1F56F}\uFE0F", desc: "A calm mind sees further. Breathe, sit, be still." },
    { name: "Reach Out", label: "Rally Your Allies", emoji: "\u{1F5E1}\uFE0F", desc: "No one builds alone. Reach out to one person today." },
  ].map(r => ({ ...r, done: !!completedRituals[r.name] }));

  const streakIcons = [
    { emoji: "\u2694\uFE0F", name: "Bodyweight Workout" },
    { emoji: "\u{1F3F9}", name: "Walk/Jog 20min" },
    { emoji: "\u{1F4D6}", name: "Read 20min" },
    { emoji: "\u{1F56F}\uFE0F", name: "Pray/Meditate 10min" },
    { emoji: "\u{1F5E1}\uFE0F", name: "Reach Out" },
  ];

  const weeklyQuests = [
    { name: "Forge the Body", desc: "Forge the Body 4x this week", xp: 50, gold: 10, progress: weeklyRitualCounts["Bodyweight Workout"] || 0, target: 4 },
    { name: "Sharpen the Mind", desc: "Sharpen the Mind 5x this week", xp: 50, gold: 10, progress: weeklyRitualCounts["Read 20min"] || 0, target: 5 },
    { name: "Rally Your Allies", desc: "Rally Your Allies 5x this week", xp: 50, gold: 10, progress: weeklyRitualCounts["Reach Out"] || 0, target: 5 },
  ];

  const ink = "#3d2b1f";
  const inkLight = "#6b4c30";
  const inkFaint = "#8b7355";
  const parchCard = "rgba(210, 180, 140, 0.45)";
  const parchCardBorder = "rgba(160, 120, 70, 0.4)";
  const parchRow = "rgba(210, 180, 140, 0.3)";
  const parchRowBorder = "rgba(160, 120, 70, 0.25)";
  const doneRow = "rgba(34, 120, 60, 0.2)";
  const doneBorder = "rgba(34, 120, 60, 0.35)";

  return (
    <div style={{ padding: "16px 16px 120px", animation: "fadeIn 0.3s ease", minHeight: "100vh", position: "relative" }}>
      {/* Parchment background */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/quest-map.png)", backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.85, pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
          padding: "10px 14px", borderRadius: 12,
          background: "rgba(60, 40, 20, 0.7)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(90, 60, 30, 0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>{cls.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f5e6d0", fontFamily: "'Cinzel', serif" }}>Level {playerLevel} {cls.title}</div>
              <div style={{ fontSize: 12, color: "#d4a050", fontWeight: 600, letterSpacing: 1 }}>RANK: {rank.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* ═══ TODAY'S BANNER — meditation title after completion ═══ */}
        {meditationComplete && meditationTitle && (
          <div style={{
            padding: "12px 16px", borderRadius: 12, marginBottom: 12,
            background: "rgba(45, 35, 20, 0.8)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(212, 160, 80, 0.3)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 10, color: "#d4a050", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
              {"\u{1F4DC}"} Today's Meditation
            </div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700,
              color: "#f5e6d0", fontStyle: "italic", lineHeight: 1.4,
            }}>"{meditationTitle}"</div>
          </div>
        )}

        {/* Streaks */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", borderRadius: 10, marginBottom: 16,
          background: "rgba(60, 40, 20, 0.6)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(90, 60, 30, 0.4)",
        }}>
          <span style={{ fontSize: 10, color: "#d4a050", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Streaks</span>
          <div style={{ display: "flex", gap: 12 }}>
            {streakIcons.map((s, i) => {
              const count = ritualStreaks[s.name] || 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 14 }}>{s.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: count > 0 ? "#d4a050" : "#f5e6d088" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ DAILY MEDITATION — GOLD ACCENTED ═══ */}
        {todayMeditation && (
          <div style={{
            marginBottom: 16, padding: "16px 14px", borderRadius: 14,
            background: meditationComplete ? doneRow : parchCard,
            border: `1px solid ${meditationComplete ? doneBorder : parchCardBorder}`,
            borderLeft: "4px solid #d4a050",
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: "#d4a050", letterSpacing: 1.5,
              textTransform: "uppercase", marginBottom: 10, fontFamily: "'Cinzel', serif",
            }}>Daily Meditation</div>
            <div onClick={() => { if (!meditationComplete) onOpenMeditation?.(); }} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 10,
              background: meditationComplete ? doneRow : parchRow,
              border: `1px solid ${meditationComplete ? doneBorder : parchRowBorder}`,
              cursor: meditationComplete ? "default" : "pointer",
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${meditationComplete ? "#2d6a30" : "#d4a050"}`,
                background: meditationComplete ? "#2d6a30" : "rgba(212, 160, 80, 0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {meditationComplete && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{"\u2713"}</span>}
              </div>
              <span style={{ fontSize: 20 }}>{todayMeditation.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: meditationComplete ? inkFaint : ink,
                  textDecoration: meditationComplete ? "line-through" : "none",
                }}>{todayMeditation.title}</div>
                <div style={{ fontSize: 11, color: inkLight, marginTop: 1 }}>{todayMeditation.prompt}</div>
              </div>
              {!meditationComplete ? (
                <div style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: "linear-gradient(135deg, #d4a050, #b8862e)",
                  color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                  boxShadow: "0 2px 8px rgba(212, 160, 80, 0.4)",
                  flexShrink: 0,
                }}>Reflect</div>
              ) : (
                <span style={{ color: "#2d6a30", fontSize: 18, flexShrink: 0 }}>{"\u2713"}</span>
              )}
            </div>
            {!meditationComplete && (
              <div style={{ fontSize: 10, color: inkFaint, fontStyle: "italic", marginTop: 8, textAlign: "center" }}>
                {"\u2728"} Awards a chest with double rare/epic chance
              </div>
            )}
          </div>
        )}

        {/* ═══ THE FIVE — GREEN ACCENTED ═══ */}
        <div style={{
          marginBottom: 20, padding: "16px 14px", borderRadius: 14,
          background: parchCard, border: `1px solid ${parchCardBorder}`,
          borderLeft: "4px solid #2d6a30",
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#2d6a30", letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
          }}>The Five {"\u2014"} Daily Rituals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rituals.map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                background: r.done ? doneRow : parchRow,
                border: `1px solid ${r.done ? doneBorder : parchRowBorder}`,
                transition: "all 0.3s ease",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${r.done ? "#2d6a30" : "#8b6c42"}`,
                  background: r.done ? "#2d6a30" : "rgba(139, 108, 66, 0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {r.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{"\u2713"}</span>}
                </div>
                <span style={{ fontSize: 18 }}>{r.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: r.done ? inkFaint : ink, textDecoration: r.done ? "line-through" : "none" }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: inkLight, marginTop: 1 }}>{r.desc}</div>
                </div>
                {!r.done ? (
                  <button onClick={() => onOpenRitual(r)} style={{
                    padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #2d6a30, #1a5c1e)",
                    color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                    boxShadow: "0 2px 8px rgba(45, 106, 48, 0.4)", flexShrink: 0,
                  }}>Start</button>
                ) : (
                  <span style={{ color: "#2d6a30", fontSize: 18, flexShrink: 0 }}>{"\u2713"}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ WEEKLY QUESTS — PURPLE ACCENTED ═══ */}
        <div style={{
          padding: "16px 14px", borderRadius: 14,
          background: parchCard, border: `1px solid ${parchCardBorder}`,
          borderLeft: "4px solid #5b3a8c",
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#5b3a8c", letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
          }}>Weekly Quests</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyQuests.map((q, i) => {
              const done = q.progress >= q.target;
              const inProgress = q.progress > 0 && !done;
              const statusLabel = done ? "Conquered" : inProgress ? "In Progress" : "Not Started";
              const statusBg = done ? "rgba(45, 106, 48, 0.2)" : inProgress ? "rgba(91, 58, 140, 0.15)" : "rgba(139, 108, 66, 0.15)";
              const statusText = done ? "#2d6a30" : inProgress ? "#5b3a8c" : inkFaint;
              return (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 10,
                  background: done ? doneRow : parchRow,
                  border: `1px solid ${done ? doneBorder : parchRowBorder}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: done ? "#2d6a30" : ink }}>{q.name}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: statusText,
                          padding: "2px 8px", borderRadius: 6, background: statusBg, letterSpacing: 0.3,
                        }}>{statusLabel}</span>
                      </div>
                      <div style={{ fontSize: 12, color: inkLight }}>{q.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 60 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#5b3a8c" }}>+{q.xp} XP</div>
                      <div style={{ fontSize: 11, color: "#8b6c42" }}>+{q.gold} {"\u{1FA99}"}</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "rgba(139, 108, 66, 0.2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min((q.progress / q.target) * 100, 100)}%`, height: "100%", borderRadius: 2,
                      background: done ? "#2d6a30" : "#5b3a8c", transition: "width 0.5s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: inkFaint, marginTop: 4 }}>{q.progress} / {q.target} this week</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}