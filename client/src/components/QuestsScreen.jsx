import { C, CLASSES, getRank } from '../constants';

export default function QuestsScreen({ onOpenRitual, completedRituals = {}, completedQuests = [], onCompleteQuest, playerClass = "warrior", playerLevel = 1, ritualStreaks = {}, dailyQuests = [], weeklyRitualCounts = {} }) {
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const rituals = [
    { name: "Bodyweight Workout", label: "Forge the Body", emoji: "⚔️", desc: "20 min bodyweight workout" },
    { name: "Walk/Jog 20min", label: "Explore the Land", emoji: "🏹", desc: "20 min walk or jog outside" },
    { name: "Read 20min", label: "Sharpen the Mind", emoji: "📖", desc: "20 min of focused reading" },
    { name: "Pray/Meditate 10min", label: "Still the Spirit", emoji: "🕯️", desc: "10 min guided stillness. Breathe." },
    { name: "Reach Out", label: "Rally Your Allies", emoji: "🗡️", desc: "Reach out to someone meaningfully" },
  ].map(r => ({ ...r, done: !!completedRituals[r.name] }));

  const streakIcons = [
    { emoji: "⚔️", name: "Bodyweight Workout" },
    { emoji: "🏹", name: "Walk/Jog 20min" },
    { emoji: "📖", name: "Read 20min" },
    { emoji: "🕯️", name: "Pray/Meditate 10min" },
    { emoji: "🗡️", name: "Reach Out" },
  ];

  // Use dailyQuests from props (randomized per day) — fallback to empty
  const quests = dailyQuests;

  // Weekly quests use real counts from Supabase
  const weeklyQuests = [
    { name: "Forge the Body", desc: "Forge the Body 4x this week", xp: 50, gold: 10, progress: weeklyRitualCounts["Bodyweight Workout"] || 0, target: 4 },
    { name: "Sharpen the Mind", desc: "Sharpen the Mind 5x this week", xp: 50, gold: 10, progress: weeklyRitualCounts["Read 20min"] || 0, target: 5 },
    { name: "Rally Your Allies", desc: "Rally Your Allies 5x this week", xp: 50, gold: 10, progress: weeklyRitualCounts["Reach Out"] || 0, target: 5 },
  ];

  // Parchment ink theme
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
    <div style={{
      padding: "16px 16px 120px", animation: "fadeIn 0.3s ease",
      minHeight: "100vh", position: "relative",
    }}>
      {/* Parchment background */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        background: "linear-gradient(160deg, #c8a96e 0%, #b8935a 40%, #a07840 100%)",
        opacity: 0.85, pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
          padding: "10px 14px", borderRadius: 12,
          background: "rgba(60, 40, 20, 0.7)", backdropFilter: "blur(8px)",
          border: `1px solid rgba(90, 60, 30, 0.5)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>{cls.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f5e6d0", fontFamily: "'Cinzel', serif" }}>Level {playerLevel} {cls.title}</div>
              <div style={{ fontSize: 12, color: "#d4a050", fontWeight: 600, letterSpacing: 1 }}>RANK: {rank.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Ritual Streaks */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", borderRadius: 10, marginBottom: 16,
          background: "rgba(60, 40, 20, 0.6)", backdropFilter: "blur(8px)",
          border: `1px solid rgba(90, 60, 30, 0.4)`,
        }}>
          <span style={{
            fontSize: 10, color: "#d4a050", fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase",
          }}>Streaks</span>
          <div style={{ display: "flex", gap: 12 }}>
            {streakIcons.map((s, i) => {
              const count = ritualStreaks[s.name] || 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 14 }}>{s.emoji}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, fontFamily: "monospace",
                    color: count > 0 ? "#d4a050" : "#f5e6d088",
                  }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ THE FIVE — GREEN ACCENTED ═══ */}
        <div style={{
          marginBottom: 20, padding: "16px 14px", borderRadius: 14,
          background: parchCard, border: `1px solid ${parchCardBorder}`,
          borderLeft: `4px solid #2d6a30`,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#2d6a30", letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
          }}>
            The Five — Daily Rituals
          </div>
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
                  transition: "all 0.3s",
                }}>
                  {r.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 18 }}>{r.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: r.done ? inkFaint : ink,
                    textDecoration: r.done ? "line-through" : "none",
                  }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: inkLight, marginTop: 1 }}>{r.desc}</div>
                </div>
                {!r.done ? (
                  <button onClick={() => onOpenRitual(r)} style={{
                    padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, #2d6a30, #1a5c1e)`,
                    color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                    boxShadow: `0 2px 8px rgba(45, 106, 48, 0.4)`,
                    flexShrink: 0,
                  }}>
                    Start
                  </button>
                ) : (
                  <span style={{ color: "#2d6a30", fontSize: 18, flexShrink: 0 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ DAILY QUESTS — BLUE ACCENTED ═══ */}
        <div style={{
          marginBottom: 20, padding: "16px 14px", borderRadius: 14,
          background: parchCard, border: `1px solid ${parchCardBorder}`,
          borderLeft: `4px solid #2a5298`,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#2a5298", letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
          }}>
            Daily Quests
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {quests.map((q) => {
              const done = completedQuests.includes(q.id);
              return (
                <div key={q.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10,
                  background: done ? doneRow : parchRow,
                  border: `1px solid ${done ? doneBorder : parchRowBorder}`,
                  transition: "all 0.3s ease",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${done ? "#2d6a30" : "#8b6c42"}`,
                    background: done ? "#2d6a30" : "rgba(139, 108, 66, 0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                  }}>
                    {done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: done ? inkFaint : ink,
                      textDecoration: done ? "line-through" : "none",
                    }}>{q.name}</div>
                    <div style={{ fontSize: 12, color: inkLight, marginTop: 2 }}>{q.desc}</div>
                  </div>
                  {!done ? (
                    <button onClick={() => onCompleteQuest && onCompleteQuest(q.id, q.xp, q.gold, q.stats)} style={{
                      padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: `linear-gradient(135deg, #2a5298, #1e3f7a)`,
                      color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                      boxShadow: `0 2px 8px rgba(42, 82, 152, 0.4)`,
                      flexShrink: 0,
                    }}>
                      Conquered
                    </button>
                  ) : (
                    <span style={{ color: "#2d6a30", fontSize: 18, flexShrink: 0 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ WEEKLY QUESTS — PURPLE ACCENTED ═══ */}
        <div style={{
          padding: "16px 14px", borderRadius: 14,
          background: parchCard, border: `1px solid ${parchCardBorder}`,
          borderLeft: `4px solid #5b3a8c`,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#5b3a8c", letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 12, fontFamily: "'Cinzel', serif",
          }}>
            Weekly Quests
          </div>
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
                        <span style={{
                          fontSize: 14, fontWeight: 600,
                          color: done ? "#2d6a30" : ink,
                        }}>{q.name}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: statusText,
                          padding: "2px 8px", borderRadius: 6,
                          background: statusBg,
                          letterSpacing: 0.3,
                        }}>{statusLabel}</span>
                      </div>
                      <div style={{ fontSize: 12, color: inkLight }}>{q.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 60 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#5b3a8c" }}>+{q.xp} XP</div>
                      <div style={{ fontSize: 11, color: "#8b6c42" }}>+{q.gold} 🪙</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "rgba(139, 108, 66, 0.2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min((q.progress / q.target) * 100, 100)}%`, height: "100%", borderRadius: 2,
                      background: done ? "#2d6a30" : "#5b3a8c",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: inkFaint, marginTop: 4 }}>
                    {q.progress} / {q.target} this week
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