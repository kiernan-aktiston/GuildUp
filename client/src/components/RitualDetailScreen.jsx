import { useState, useEffect } from 'react';
import { C, RITUAL_INSTRUCTIONS } from '../constants';
import { getRandomQuote } from '../gameLogic';

export default function RitualDetailScreen({ ritual, onBack }) {
  const name = ritual?.name || "Bodyweight Workout";
  const info = RITUAL_INSTRUCTIONS[name] || RITUAL_INSTRUCTIONS["Bodyweight Workout"];
  const [phase, setPhase] = useState("prep"); // "prep" → "timer"
  const [showWhy, setShowWhy] = useState(false);
  const [quote] = useState(() => getRandomQuote(name));
  const [timeLeft, setTimeLeft] = useState(info.duration_seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const pct = ((info.duration_seconds - timeLeft) / info.duration_seconds) * 100;

  // ===== WHY THIS MATTERS POPUP =====
  const WhyPopup = () => (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", display: "flex",
      alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease", padding: 24,
    }} onClick={() => setShowWhy(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 360, padding: 28, borderRadius: 20,
        background: C.surface, border: `1px solid ${C.border}`,
        boxShadow: `0 0 60px ${C.gold}11`,
      }}>
        <div style={{
          fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", marginBottom: 16, textAlign: "center",
        }}>Why This Matters</div>
        <p style={{
          fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 24,
        }}>{info.why}</p>
        <button onClick={() => setShowWhy(false)} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 15, fontWeight: 700,
        }}>
          Got It
        </button>
      </div>
    </div>
  );

  // ===== PREP SCREEN =====
  if (phase === "prep") {
    return (
      <div style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse at 50% 30%, ${C.gold}08 0%, transparent 50%),
          linear-gradient(180deg, #0a0e17 0%, #1a1028 50%, #0a0e17 100%)
        `,
        display: "flex", flexDirection: "column",
        padding: "48px 24px 120px", animation: "fadeIn 0.4s ease",
      }}>
        {showWhy && <WhyPopup />}

        {/* TOP: Ritual label + activity name */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{
            fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 3,
            textTransform: "uppercase", marginBottom: 6,
          }}>{info.label}</div>
          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: 22, color: C.text,
            marginBottom: 2, lineHeight: 1.3,
          }}>{info.activityName}</h2>
          <div style={{ fontSize: 13, color: C.textMuted }}>{info.time}</div>
        </div>

        {/* Sprite + Quote as one unit */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
          <img
            src={info.image}
            alt={info.featuredQuote.author}
            style={{
              width: 260, height: 260, objectFit: "contain",
              imageRendering: "pixelated",
              mixBlendMode: "lighten",
              marginBottom: -8,
            }}
          />
          <div style={{
            padding: "12px 18px", borderRadius: 12, width: "100%",
            background: C.card, border: `1px solid ${C.cardBorder}`,
            backdropFilter: "blur(8px)", textAlign: "center",
          }}>
            <div style={{ fontSize: 14, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>
              "{info.featuredQuote.text}"
            </div>
            <div style={{ fontSize: 12, color: C.gold }}>— {info.featuredQuote.author}</div>
          </div>
        </div>

        {/* What to Do */}
        <div style={{
          padding: "14px 18px", borderRadius: 14, marginBottom: 20,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 10,
          }}>WHAT TO DO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {info.instructions.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0,
                  background: C.ritualDone,
                }} />
                <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
          {info.note && (
            <div style={{
              marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`,
              fontSize: 13, color: C.textMuted, fontStyle: "italic",
            }}>
              {info.note}
            </div>
          )}
        </div>

        {/* Three buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
          <button onClick={() => setPhase("timer")} style={{
            padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
            color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 0.5,
            boxShadow: `0 4px 20px ${C.ritualDone}44`,
          }}>
            I Am Ready to Begin
          </button>
          <button onClick={() => setShowWhy(true)} style={{
            padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            color: "#000", fontSize: 15, fontWeight: 600,
          }}>
            Why This Matters
          </button>
          <button onClick={() => onBack(false)} style={{
            padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, #9f1239, #881337)`,
            color: "#fda4af", fontSize: 15, fontWeight: 600,
          }}>
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  // ===== TIMER SCREEN =====
  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(ellipse at 50% 80%, #1a0a0a 0%, transparent 50%),
        linear-gradient(180deg, #0a0e17 0%, #1a1028 50%, #0a0e17 100%)
      `,
      display: "flex", flexDirection: "column",
      padding: "32px 24px 120px", position: "relative", animation: "fadeIn 0.4s ease",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${running ? C.ritualDone : C.xp}12 0%, transparent 70%)`,
        filter: "blur(40px)", pointerEvents: "none",
        transition: "background 0.5s",
      }} />

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 3,
          textTransform: "uppercase", marginBottom: 6,
        }}>{info.label}</div>
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 24, color: C.text,
          marginBottom: 4, lineHeight: 1.3,
        }}>{info.ritualLabel}</h2>
        <div style={{ fontSize: 13, color: C.textMuted }}>{info.time}</div>
      </div>

      {/* Countdown Timer */}
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          fontSize: 60, fontWeight: 700, fontFamily: "monospace",
          color: finished ? C.ritualDone : timeLeft <= 60 && running ? "#ef4444" : C.text,
          letterSpacing: 6,
          textShadow: running ? `0 0 40px ${C.xp}33` : "none",
          transition: "color 0.5s",
        }}>
          {finished ? "✓" : display}
        </div>
        {finished && (
          <div style={{ fontSize: 16, color: C.ritualDone, fontWeight: 600, marginTop: 8 }}>
            Ritual Complete!
          </div>
        )}
        {!finished && (
          <div style={{
            width: 200, height: 4, background: C.surfaceLight, borderRadius: 2,
            marginTop: 16, overflow: "hidden",
          }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, ${C.xp}, ${C.ritualDone})`,
              transition: "width 1s linear",
            }} />
          </div>
        )}
      </div>

      {/* Bottom: Quote + Buttons */}
      <div style={{ marginTop: "auto" }}>
        <div style={{
          padding: "16px 20px", borderRadius: 12, marginBottom: 16,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          backdropFilter: "blur(8px)", textAlign: "center",
        }}>
          <div style={{ fontSize: 14, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 6 }}>
            "{quote.text}"
          </div>
          <div style={{ fontSize: 12, color: C.textDim }}>— {quote.author}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {finished ? (
            <button onClick={() => onBack(true)} style={{
              padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
              color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
              boxShadow: `0 4px 20px ${C.ritualDone}44`,
            }}>
              Claim +10 XP
            </button>
          ) : (
            <>
              <button onClick={() => setRunning(!running)} style={{
                padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                background: running
                  ? `linear-gradient(135deg, #ca8a04, #a16207)`
                  : `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
                color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
                boxShadow: running ? `0 4px 20px #ca8a0444` : `0 4px 20px ${C.ritualDone}44`,
                transition: "all 0.3s",
              }}>
                {running ? "Pause" : timeLeft < info.duration_seconds ? "Resume" : "Start Timer"}
              </button>
              <button onClick={() => onBack(false)} style={{
                padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, #9f1239, #881337)`,
                color: "#fda4af", fontSize: 15, fontWeight: 600,
              }}>
                Quit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// AVATAR / PROFILE SCREEN
// ============================================
