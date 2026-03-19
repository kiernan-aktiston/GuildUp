import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const SETTLE_PROMPTS = [
  { text: "Find a comfortable position.", delay: 0 },
  { text: "Close your eyes.", delay: 3 },
  { text: "Take a deep breath.", delay: 6 },
  { text: "Let go.", delay: 9 },
];

// Breathing cycle: 4s inhale, 2s hold, 6s exhale = 12s total
const INHALE = 4;
const HOLD = 2;
const EXHALE = 6;
const CYCLE = INHALE + HOLD + EXHALE;

export default function StillTheSpiritFlow({ onBack }) {
  const [step, setStep] = useState("prep"); // prep, settle, meditate, done
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);

  // Settle countdown
  const [settleTime, setSettleTime] = useState(10);
  const [settlePromptIdx, setSettlePromptIdx] = useState(0);

  // Main timer
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [breathPhase, setBreathPhase] = useState("inhale"); // inhale, hold, exhale
  const [breathCycle, setBreathCycle] = useState(0); // seconds into current cycle
  const intervalRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Pray/Meditate 10min"];
  const quote = getRandomQuote("Pray/Meditate 10min");

  // Settle timer
  useEffect(() => {
    if (step !== "settle") return;
    const id = setInterval(() => {
      setSettleTime(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setStep("meditate");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  // Update settle prompts
  useEffect(() => {
    if (step !== "settle") return;
    const elapsed = 10 - settleTime;
    const idx = SETTLE_PROMPTS.filter(p => p.delay <= elapsed).length - 1;
    if (idx >= 0) setSettlePromptIdx(idx);
  }, [settleTime, step]);

  // Main meditation timer + breathing cycle
  useEffect(() => {
    if (step !== "meditate") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setStep("done");
          return 0;
        }
        return prev - 1;
      });
      setBreathCycle(prev => {
        const next = (prev + 1) % CYCLE;
        if (next < INHALE) setBreathPhase("inhale");
        else if (next < INHALE + HOLD) setBreathPhase("hold");
        else setBreathPhase("exhale");
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [step]);

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Breathing circle scale
  const getBreathScale = () => {
    if (breathPhase === "inhale") return 1.0 + (breathCycle / INHALE) * 0.4;
    if (breathPhase === "hold") return 1.4;
    const exhaleProgress = (breathCycle - INHALE - HOLD) / EXHALE;
    return 1.4 - exhaleProgress * 0.4;
  };

  const BgLayer = () => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/spirit-bg.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      opacity: 0.15, pointerEvents: "none", zIndex: 0,
    }} />
  );

  const btnPrimary = {
    width: "100%", padding: "16px", borderRadius: 12, border: "none",
    cursor: "pointer", fontSize: 15, fontWeight: 700,
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
    color: "#000",
  };

  // ── PREP SLIDES ──
  const slides = [
    {
      emoji: "🕯️",
      title: "Still the Spirit",
      body: "The world is loud. Your mind is louder. Stillness is not the absence of noise — it is the practice of not following it.",
      accent: null,
    },
    {
      emoji: "🌊",
      title: "Empty to Receive",
      body: "A cup that is already full cannot be filled. Meditation is the act of emptying — setting down your plans, your worries, your identity — so that something deeper can enter. Call it God, the universe, your truest self. It doesn't matter what name you give it. What matters is that you make room.",
      accent: null,
    },
    {
      emoji: "🫁",
      title: "How It Works",
      body: "Sit upright. Close your eyes. A breathing circle will guide you: breathe in as it expands, hold, breathe out as it contracts. When thoughts come — and they will — don't chase them. Let them pass like clouds. Return to the breath.",
      accent: "10 minutes. That's all.",
    },
    {
      emoji: "✨",
      title: "What Happens in the Silence",
      body: "You won't feel different the first time. Maybe not the fifth. But somewhere around the second week, you'll notice: the things that used to rattle you won't land the same way. You'll respond instead of react. You'll hear yourself think for the first time in years.",
      accent: "The stillness is where the strength lives.",
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
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>The Ritual</div>
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
              <button onClick={() => setStep("settle")} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: "#22c55e", color: "#000",
              }}>Enter the Stillness</button>
            ) : (
              <button onClick={() => setPrepSlide(prepSlide + 1)} style={btnPrimary}>Next</button>
            )}
            <button onClick={() => setShowWhy(true)} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: "#ef4444", color: "#000",
            }}>Not Now</button>
          </div>

          {showWhy && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.85)", display: "flex",
              alignItems: "center", justifyContent: "center",
              animation: "fadeIn 0.3s ease", padding: 24, overflowY: "auto",
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
                    boxShadow: `0 4px 20px rgba(0,0,0,0.6)`, marginBottom: 12,
                  }}>
                    <img src="/John.png" alt="John of Damascus" style={{
                      width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated",
                      filter: "brightness(1.1)",
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Face the Resistance</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>
                      "{info.featuredQuote.text}"
                    </div>
                    <div style={{ fontSize: 11, color: C.gold }}>— {info.featuredQuote.author}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  Your mind will tell you this is a waste of time. It will say you have things to do, messages to check, problems to solve. That restlessness is not productivity — it is the noise that drowns out everything that matters.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  Every tradition, every culture, every era of human history has a practice of stillness at its center. The monks prayed. The samurai sat in silence before battle. The Stoics journaled at dawn. They all understood the same thing: a mind that cannot be still is a mind that cannot be trusted.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  Ten minutes of silence will not solve your problems. But it will create the space for you to see them clearly — and clarity is where every right decision begins.
                </p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>
                  Be still. The answers are already there.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => { setShowWhy(false); setStep("settle"); }} style={{
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

  // ── SETTLE IN (10 seconds) ──
  if (step === "settle") {
    const prompt = SETTLE_PROMPTS[settlePromptIdx];
    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", position: "relative",
        background: "#000",
      }}>
        <div style={{
          fontSize: 18, color: C.text, fontWeight: 400,
          textAlign: "center", lineHeight: 1.8,
          animation: "fadeIn 0.8s ease",
          fontFamily: "'Outfit', sans-serif",
        }} key={settlePromptIdx}>
          {prompt.text}
        </div>
        <div style={{
          position: "absolute", bottom: 60,
          fontSize: 12, color: C.textDim, letterSpacing: 2,
        }}>
          {settleTime}
        </div>
      </div>
    );
  }

  // ── MEDITATION SCREEN ──
  if (step === "meditate") {
    const scale = getBreathScale();
    const phaseLabel = breathPhase === "inhale" ? "Breathe in..." : breathPhase === "hold" ? "Hold..." : "Breathe out...";
    const phaseColor = breathPhase === "inhale" ? "#a78bfa" : breathPhase === "hold" ? C.gold : "#60a5fa";
    const minutesLeft = Math.ceil(timeLeft / 60);

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 120px", position: "relative",
        background: "#000",
      }}>
        {/* Subtle time indicator at top */}
        <div style={{
          position: "absolute", top: 40, left: 0, right: 0,
          textAlign: "center",
        }}>
          <span style={{ fontSize: 12, color: C.textDim, letterSpacing: 2 }}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Breathing circle */}
        <div style={{
          width: 200, height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${phaseColor}15 0%, ${phaseColor}08 50%, transparent 70%)`,
          border: `2px solid ${phaseColor}33`,
          boxShadow: `0 0 60px ${phaseColor}11, inset 0 0 40px ${phaseColor}08`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${scale})`,
          transition: "transform 1s ease-in-out, border-color 1s ease, box-shadow 1s ease",
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${phaseColor}22 0%, transparent 70%)`,
            border: `1px solid ${phaseColor}22`,
          }} />
        </div>

        {/* Breathing label */}
        <div style={{
          marginTop: 32,
          fontSize: 16, color: phaseColor, fontWeight: 400,
          letterSpacing: 2, textTransform: "lowercase",
          transition: "color 1s ease",
          fontFamily: "'Outfit', sans-serif",
        }}>
          {phaseLabel}
        </div>

        {/* Minutes remaining */}
        <div style={{
          position: "absolute", bottom: 80,
          fontSize: 11, color: C.textDim, letterSpacing: 1,
        }}>
          {minutesLeft} {minutesLeft === 1 ? "minute" : "minutes"} remaining
        </div>

        {/* Subtle skip button */}
        <button onClick={() => setStep("done")} style={{
          position: "absolute", bottom: 40,
          background: "none", border: "none",
          color: C.textDim, fontSize: 12, cursor: "pointer",
          padding: "8px 16px",
        }}>
          end early
        </button>
      </div>
    );
  }

  // ── DONE ──
  if (step === "done") {
    return (
      <div dir="ltr" style={{
        minHeight: "100vh", position: "relative",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 120px", animation: "fadeIn 0.8s ease",
        background: "#000",
      }}>
        <div style={{ textAlign: "center" }}>
          {/* Gentle bell visual */}
          <div style={{
            fontSize: 56, marginBottom: 24,
            filter: `drop-shadow(0 0 20px ${C.gold}33)`,
          }}>🕯️</div>

          <div style={{
            fontSize: 48, color: C.ritualDone, fontWeight: 800,
            fontFamily: "'Cinzel', serif", marginBottom: 8,
          }}>✓</div>
          <div style={{
            fontSize: 20, color: C.ritualDone, fontWeight: 700, marginBottom: 8,
          }}>Ritual Complete</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>
            The stillness is yours. Carry it forward.
          </div>

          <div style={{
            padding: "14px 20px", borderRadius: 12, display: "inline-block",
            background: C.card, border: `1px solid ${C.cardBorder}`,
            marginBottom: 32, maxWidth: 300,
          }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6 }}>
              "{quote.text}"
            </span>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>— {quote.author}</div>
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