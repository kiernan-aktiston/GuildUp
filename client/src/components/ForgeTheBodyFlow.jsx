import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const WORKOUT_ROUNDS = [
  { name: "Pushups", emoji: "💪" },
  { name: "Squats", emoji: "🦵" },
  { name: "Sit-ups", emoji: "🔥" },
  { name: "Lunges", emoji: "⚔️" },
  { name: "Plank", emoji: "🛡️" },
];

const WORK_TIME = 45;
const REST_TIME = 15;
const ROUNDS = 4;

export default function ForgeTheBodyFlow({ onBack }) {
  const [step, setStep] = useState("prep"); // prep, workout, done
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);

  // Workout state
  const [round, setRound] = useState(1);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [phase, setPhase] = useState("work"); // "work" | "rest" | "round_rest"
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Bodyweight Workout"];
  const quote = getRandomQuote("Bodyweight Workout");

  const totalExercises = WORKOUT_ROUNDS.length;
  const currentExercise = WORKOUT_ROUNDS[exerciseIdx];

  useEffect(() => {
    if (!running || finished) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        // Advance phase
        clearInterval(intervalRef.current);
        advancePhase();
        return 0;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phase, exerciseIdx, round]);

  const advancePhase = () => {
    if (phase === "work") {
      if (exerciseIdx < totalExercises - 1) {
        setPhase("rest");
        setTimeLeft(REST_TIME);
        setRunning(true);
      } else {
        // Finished last exercise of a round
        if (round < ROUNDS) {
          setPhase("round_rest");
          setTimeLeft(60);
          setRunning(true);
        } else {
          setFinished(true);
          setRunning(false);
        }
      }
    } else if (phase === "rest") {
      setExerciseIdx(i => i + 1);
      setPhase("work");
      setTimeLeft(WORK_TIME);
      setRunning(true);
    } else if (phase === "round_rest") {
      setRound(r => r + 1);
      setExerciseIdx(0);
      setPhase("work");
      setTimeLeft(WORK_TIME);
      setRunning(true);
    }
  };

  const slides = [
    {
      emoji: "⚔️",
      title: "Forge the Body",
      body: "Your body is the vessel that carries everything else — your mind, your spirit, your ambition. Training it isn't vanity. It's preparation. Every rep builds the discipline that bleeds into every other area of your life.",
      accent: null,
    },
    {
      emoji: "🛡️",
      title: "No Excuses Remain",
      body: "Twenty minutes. Bodyweight only. No equipment, no gym, no conditions. This is the minimum viable dose of physical discipline. It can be done anywhere, anytime.",
      accent: "The warrior who makes excuses has already lost.",
    },
    {
      emoji: "🔥",
      title: "Four Rounds of Five",
      body: "Five exercises. Four rounds. 45 seconds on, 15 seconds rest. That's it. Push to your limit on each set. Form over speed — injury ends streaks.",
      accent: "Begin when you are ready.",
    },
  ];

  const isLastSlide = prepSlide === slides.length - 1;

  // ── PREP SLIDES ──
  if (step === "prep") {
    const slide = slides[prepSlide];
    return (
      <div style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, height: "100vh",
          backgroundImage: "url(/arena-bg.png)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.2, pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
          <button onClick={() => prepSlide > 0 ? setPrepSlide(prepSlide - 1) : onBack(false)} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 16, padding: 0, textAlign: "left",
          }}>← Back</button>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setPrepSlide(i)} style={{
                width: i === prepSlide ? 24 : 8, height: 8, borderRadius: 4,
                background: i === prepSlide ? C.gold : C.surfaceLight,
                transition: "all 0.3s ease", cursor: "pointer",
              }} />
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeIn 0.25s ease" }} key={prepSlide}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{slide.emoji}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 6 }}>{slide.title}</div>
              {prepSlide === 0 && (
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Forge the Body</div>
              )}
            </div>
            <div style={{ padding: "20px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(8px)" }}>
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>{slide.body}</p>
              {slide.accent && (
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontStyle: "italic", fontWeight: 600, marginTop: 14 }}>{slide.accent}</p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            {isLastSlide ? (
              <button onClick={() => setStep("workout")} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: "#22c55e", color: "#000",
              }}>Begin Workout</button>
            ) : (
              <button onClick={() => setPrepSlide(prepSlide + 1)} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#000",
              }}>Next</button>
            )}
            <button onClick={() => onBack(false)} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: "#ef4444", color: "#fff",
            }}>Not Now</button>
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (finished || step === "done") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, height: "100vh",
          backgroundImage: "url(/arena-bg.png)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.2, pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
          <div style={{ fontSize: 48, color: C.ritualDone, fontWeight: 800, fontFamily: "'Cinzel', serif", marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 22, color: C.ritualDone, fontWeight: 700, marginBottom: 8 }}>Ritual Complete!</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>4 Rounds · 5 Exercises · 20 Minutes</div>
          <div style={{
            padding: "14px 20px", borderRadius: 10, display: "inline-block",
            background: C.card, border: `1px solid ${C.cardBorder}`, marginBottom: 32,
          }}>
            <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.5 }}>"{quote.text}"</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>— {quote.author}</div>
          </div>
          <div>
            <button onClick={() => onBack(true)} style={{
              padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
              color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
              boxShadow: `0 4px 20px ${C.ritualDone}44`,
            }}>Claim +10 XP</button>
          </div>
        </div>
      </div>
    );
  }

  // ── WORKOUT SCREEN ──
  const phaseColor = phase === "work" ? C.ritualDone : "#f59e0b";
  const phaseLabel = phase === "work" ? "WORK" : phase === "rest" ? "REST" : "ROUND REST";
  const progressPct = phase === "work"
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : phase === "rest"
      ? ((REST_TIME - timeLeft) / REST_TIME) * 100
      : ((60 - timeLeft) / 60) * 100;

  return (
    <div style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/arena-bg.png)",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.15, pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <button onClick={() => onBack(false)} style={{
          background: "none", border: "none", color: C.textMuted, fontSize: 14,
          cursor: "pointer", marginBottom: 16, padding: 0,
        }}>← Quit</button>

        {/* Round indicator */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            Round {round} of {ROUNDS}
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {Array.from({ length: ROUNDS }).map((_, i) => (
              <div key={i} style={{
                width: 28, height: 6, borderRadius: 3,
                background: i < round - 1 ? C.ritualDone : i === round - 1 ? C.gold : C.surfaceLight,
                transition: "background 0.3s",
              }} />
            ))}
          </div>
        </div>

        {/* Current exercise */}
        {phase !== "round_rest" ? (
          <div style={{
            padding: "24px", borderRadius: 16, marginBottom: 20, textAlign: "center",
            background: C.card, border: `2px solid ${phaseColor}44`,
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{currentExercise.emoji}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>
              {currentExercise.name}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: phaseColor, textTransform: "uppercase" }}>
              {phaseLabel}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
              {WORKOUT_ROUNDS.map((ex, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i < exerciseIdx ? C.ritualDone : i === exerciseIdx ? C.gold : C.surfaceLight,
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            padding: "24px", borderRadius: 16, marginBottom: 20, textAlign: "center",
            background: C.card, border: `2px solid ${C.gold}44`,
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: C.gold, marginBottom: 4 }}>
              Round {round} Complete!
            </div>
            <div style={{ fontSize: 13, color: C.textMuted }}>Rest — next round in {timeLeft}s</div>
          </div>
        )}

        {/* Big timer */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            fontSize: 72, fontWeight: 700, fontFamily: "monospace",
            color: timeLeft <= 5 && running ? "#ef4444" : phaseColor,
            letterSpacing: 4, transition: "color 0.3s",
            textShadow: running ? `0 0 40px ${phaseColor}33` : "none",
          }}>
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
          <div style={{ height: 6, background: C.surfaceLight, borderRadius: 3, overflow: "hidden", marginTop: 12 }}>
            <div style={{
              width: `${progressPct}%`, height: "100%", borderRadius: 3,
              background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}88)`,
              transition: "width 1s linear",
            }} />
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => setRunning(r => !r)} style={{
            width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
            background: running
              ? `linear-gradient(135deg, #ca8a04, #a16207)`
              : `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
            color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
            transition: "all 0.3s",
          }}>
            {running ? "Pause" : "Start / Resume"}
          </button>
          <button onClick={() => setStep("done")} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            color: "#000", fontSize: 14, fontWeight: 700,
          }}>
            Mark Complete Early
          </button>
        </div>

        {/* Quote */}
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 10,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.5 }}>"{quote.text}"</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>— {quote.author}</div>
        </div>
      </div>
    </div>
  );
}
