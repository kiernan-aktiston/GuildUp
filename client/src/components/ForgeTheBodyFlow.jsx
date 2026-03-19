import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const EXERCISES = [
  { name: "Jumping Jacks", emoji: "⭐", duration: 60, instruction: "Full extension — arms overhead, feet wide, stay light on your toes." },
  { name: "Push-ups", emoji: "💪", duration: 60, instruction: "Chest to floor, full lockout at the top. Scale to knees if needed." },
  { name: "Bodyweight Squats", emoji: "🦵", duration: 60, instruction: "Feet shoulder-width, break parallel, drive through your heels." },
  { name: "Plank", emoji: "🧱", duration: 60, instruction: "Forearms down, body straight as a board. Squeeze everything." },
  { name: "Lunges", emoji: "🏋️", duration: 60, instruction: "Alternate legs. Back knee kisses the ground, front knee stays over ankle." },
  { name: "Mountain Climbers", emoji: "⛰️", duration: 60, instruction: "Hands planted, drive knees to chest. Fast and controlled." },
  { name: "Burpees", emoji: "🔥", duration: 45, instruction: "Drop, chest to floor, push up, jump. No half reps." },
  { name: "Superman Hold", emoji: "🦸", duration: 45, instruction: "Face down, arms and legs lifted. Squeeze your back. Hold steady." },
];

export default function ForgeTheBodyFlow({ onBack }) {
  const [step, setStep] = useState("prep"); // prep, workout, transition, done
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [exerciseFinished, setExerciseFinished] = useState(false);
  const intervalRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Bodyweight Workout"];
  const quote = getRandomQuote("Bodyweight Workout");
  const currentExercise = EXERCISES[exerciseIdx];
  const isLastExercise = exerciseIdx === EXERCISES.length - 1;

  // Timer logic
  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setExerciseFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, timeLeft]);

  const startExercise = () => {
    setTimeLeft(currentExercise.duration);
    setRunning(true);
    setExerciseFinished(false);
    setStep("workout");
  };

  const nextExercise = () => {
    if (isLastExercise) {
      setStep("done");
    } else {
      setExerciseIdx(prev => prev + 1);
      setStep("transition");
      setExerciseFinished(false);
    }
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = currentExercise ? ((currentExercise.duration - timeLeft) / currentExercise.duration) * 100 : 0;

  // Shared styles
  const btnPrimary = {
    width: "100%", padding: "16px", borderRadius: 12, border: "none",
    cursor: "pointer", fontSize: 15, fontWeight: 700,
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
    color: "#000",
  };

  const BgLayer = () => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/forge-bg.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      opacity: 0.2, pointerEvents: "none", zIndex: 0,
    }} />
  );

  // ── PREP SLIDES ──
  const slides = [
    {
      emoji: "⚔️",
      title: "Forge the Body",
      body: "There are no shortcuts. No hacks, no workarounds, no secret formulas. The only way to get stronger is to start — one day at a time, one rep at a time, one decision at a time.",
      accent: null,
    },
    {
      emoji: "🔨",
      title: "No Equipment. No Excuses.",
      body: "8 exercises, 10 minutes, bodyweight only. Each movement targets a different part of your body. All you need is the floor beneath you.",
      accent: null,
    },
    {
      emoji: "🔥",
      title: "How It Works",
      body: "Each exercise has a countdown timer. When time's up, you move to the next one. The app guides you through every rep.",
      accent: "Form over speed. Discipline over intensity.",
    },
    {
      emoji: "⚡",
      title: "Every Rep Counts",
      body: "This isn't about being the strongest in the room. It's about being stronger than you were yesterday. Show up. Do the work.",
      accent: "The forge awaits.",
    },
  ];

  const isLastSlide = prepSlide === slides.length - 1;

  if (step === "prep") {
    const slide = slides[prepSlide];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
          <button onClick={() => {
            if (prepSlide > 0) setPrepSlide(prepSlide - 1);
            else onBack(false);
          }} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 16, padding: 0,
          }}>← Back</button>

          {/* Slide dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setPrepSlide(i)} style={{
                width: i === prepSlide ? 24 : 8, height: 8, borderRadius: 4,
                background: i === prepSlide ? C.gold : C.surfaceLight,
                transition: "all 0.3s ease", cursor: "pointer",
              }} />
            ))}
          </div>

          {/* Card */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
            animation: "fadeIn 0.25s ease",
          }} key={prepSlide}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{slide.emoji}</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700,
                color: C.gold, marginBottom: 6,
              }}>{slide.title}</div>
              {prepSlide === 0 && (
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>The Ritual</div>
              )}
            </div>

            <div style={{
              padding: "20px", borderRadius: 14,
              background: C.card, border: `1px solid ${C.cardBorder}`,
              backdropFilter: "blur(8px)",
            }}>
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>
                {slide.body}
              </p>
              {slide.accent && (
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontStyle: "italic", fontWeight: 600, marginTop: 14 }}>
                  {slide.accent}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            {isLastSlide ? (
              <button onClick={() => setStep("transition")} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: "#22c55e", color: "#000",
              }}>
                Begin Workout
              </button>
            ) : (
              <button onClick={() => setPrepSlide(prepSlide + 1)} style={btnPrimary}>
                Next
              </button>
            )}
            <button onClick={() => setShowWhy(true)} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: "#ef4444", color: "#000",
            }}>
              Not Now
            </button>
          </div>

          {/* Exit gate modal */}
          {showWhy && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.85)", display: "flex",
              alignItems: "center", justifyContent: "center",
              animation: "fadeIn 0.3s ease", padding: 24,
              overflowY: "auto",
            }}>
              <div onClick={e => e.stopPropagation()} style={{
                width: "100%", maxWidth: 360, padding: 28, borderRadius: 20,
                background: C.surface, border: `1px solid ${C.border}`,
                maxHeight: "85vh", overflowY: "auto",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
                  <div style={{
                    width: 110, height: 110, borderRadius: "50%", overflow: "hidden",
                    border: `3px solid ${C.gold}44`,
                    background: "radial-gradient(circle, #1a1a2e 60%, #000 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 15px ${C.gold}11`,
                    marginBottom: 12,
                  }}>
                    <img src="/Socrates.png" alt="Socrates" style={{
                      width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated",
                      filter: "brightness(1.1)",
                    }} />
                  </div>
                  <div style={{
                    fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2,
                    textTransform: "uppercase", marginBottom: 12, textAlign: "center",
                  }}>Face the Resistance</div>
                  <div style={{
                    padding: "10px 16px", borderRadius: 10, width: "100%",
                    background: C.card, border: `1px solid ${C.cardBorder}`,
                    textAlign: "center", marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>
                      "{info.featuredQuote.text}"
                    </div>
                    <div style={{ fontSize: 11, color: C.gold }}>— {info.featuredQuote.author}</div>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  The voice telling you to skip today is the same voice that kept you where you are. It will always have a reason — you're tired, you're busy, you'll do it tomorrow. Tomorrow never comes for the undisciplined.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  Ten minutes. That's all this takes. You spend longer scrolling, longer debating, longer doing nothing. Your body was built to move, and every day you don't use it, it weakens.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  The people who build the lives they want aren't more motivated than you. They just stopped negotiating with themselves. They showed up on the days they didn't feel like it.
                </p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>
                  Step onto the forge. Begin.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => { setShowWhy(false); setStep("transition"); }} style={{
                    width: "100%", padding: "16px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 15, fontWeight: 700,
                    background: "#22c55e", color: "#000",
                  }}>You're Right — Let's Go</button>
                  <button onClick={() => { setShowWhy(false); onBack(false); }} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 14, fontWeight: 700,
                    background: "#ef4444", color: "#000",
                  }}>Not Today</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TRANSITION (preview next exercise) ──
  if (step === "transition") {
    const ex = EXERCISES[exerciseIdx];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
            Exercise {exerciseIdx + 1} of {EXERCISES.length}
          </div>

          {/* Exercise progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
            {EXERCISES.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: i < exerciseIdx ? C.ritualDone : i === exerciseIdx ? C.gold : C.surfaceLight,
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>

          <div style={{ fontSize: 64, marginBottom: 16 }}>{ex.emoji}</div>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 700,
            color: C.gold, marginBottom: 12,
          }}>{ex.name}</div>

          <div style={{
            padding: "16px 20px", borderRadius: 14, marginBottom: 24,
            background: C.card, border: `1px solid ${C.cardBorder}`,
            backdropFilter: "blur(8px)", maxWidth: 340, margin: "0 auto 24px",
          }}>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7 }}>{ex.instruction}</p>
            <div style={{ marginTop: 10, fontSize: 13, color: C.gold, fontWeight: 600 }}>
              {ex.duration} seconds
            </div>
          </div>

          <button onClick={startExercise} style={{
            width: "100%", maxWidth: 300, padding: "18px", borderRadius: 12, border: "none",
            cursor: "pointer", fontSize: 16, fontWeight: 700,
            background: "#22c55e", color: "#000",
            boxShadow: `0 4px 20px rgba(34, 197, 94, 0.3)`,
          }}>
            {exerciseIdx === 0 ? "Start First Exercise" : "Start"}
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE WORKOUT ──
  if (step === "workout") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "24px 20px 120px", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>
              {exerciseIdx + 1} / {EXERCISES.length}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {EXERCISES.map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: i < exerciseIdx ? C.ritualDone : i === exerciseIdx ? C.gold : C.surfaceLight,
                }} />
              ))}
            </div>
          </div>

          {/* Center: timer + exercise info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{currentExercise.emoji}</div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700,
              color: C.gold, marginBottom: 8,
            }}>{currentExercise.name}</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, textAlign: "center", maxWidth: 280 }}>
              {currentExercise.instruction}
            </div>

            {/* Timer display */}
            <div style={{
              fontSize: exerciseFinished ? 48 : 72, fontWeight: 800,
              fontFamily: "monospace",
              color: exerciseFinished ? C.ritualDone : timeLeft <= 10 && timeLeft > 0 ? "#ef4444" : C.text,
              textShadow: exerciseFinished ? `0 0 20px ${C.ritualDone}44` : timeLeft <= 10 && timeLeft > 0 ? "0 0 20px #ef444444" : "none",
              transition: "color 0.3s ease",
              marginBottom: 8,
            }}>
              {exerciseFinished ? "✓" : formatTime(timeLeft)}
            </div>

            {exerciseFinished && (
              <div style={{ fontSize: 16, color: C.ritualDone, fontWeight: 600, marginBottom: 8, animation: "fadeIn 0.3s ease" }}>
                Exercise Complete!
              </div>
            )}

            {/* Progress bar */}
            <div style={{
              width: 240, height: 6, background: C.surfaceLight, borderRadius: 3,
              overflow: "hidden", marginTop: 8,
            }}>
              <div style={{
                width: `${progressPct}%`, height: "100%", borderRadius: 3,
                background: exerciseFinished
                  ? C.ritualDone
                  : `linear-gradient(90deg, ${C.gold}, #ef4444)`,
                transition: "width 1s linear",
              }} />
            </div>
          </div>

          {/* Bottom buttons */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {exerciseFinished ? (
              <button onClick={nextExercise} style={{
                width: "100%", padding: "18px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 16, fontWeight: 700,
                background: isLastExercise
                  ? `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`
                  : `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                color: isLastExercise ? "#fff" : "#000",
                boxShadow: isLastExercise ? `0 4px 20px ${C.ritualDone}44` : "none",
              }}>
                {isLastExercise ? "Finish Workout" : `Next: ${EXERCISES[exerciseIdx + 1].name}`}
              </button>
            ) : (
              <button onClick={() => setRunning(!running)} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: running
                  ? "rgba(202, 138, 4, 0.8)"
                  : `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
                color: "#fff",
              }}>
                {running ? "Pause" : "Resume"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (step === "done") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
          <div style={{
            fontSize: 48, color: C.ritualDone, fontWeight: 800,
            fontFamily: "'Cinzel', serif", marginBottom: 8,
          }}>✓</div>
          <div style={{
            fontSize: 20, color: C.ritualDone, fontWeight: 700, marginBottom: 8,
          }}>Ritual Complete!</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>
            {EXERCISES.length} exercises conquered
          </div>
          <div style={{
            padding: "12px 20px", borderRadius: 10, display: "inline-block",
            background: C.card, border: `1px solid ${C.cardBorder}`,
            marginBottom: 32,
          }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
              "{quote.text}"
            </span>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>— {quote.author}</div>
          </div>
          <div>
            <button onClick={() => onBack(true)} style={{
              padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
              color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
              boxShadow: `0 4px 20px ${C.ritualDone}44`,
            }}>
              Claim +10 XP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}