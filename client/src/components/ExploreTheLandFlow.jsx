import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const TIERS = [
  { name: "Scout", desc: "4 min walk / 1 min jog × 4", intervals: [
    { type: "walk", duration: 240 }, { type: "jog", duration: 60 },
    { type: "walk", duration: 240 }, { type: "jog", duration: 60 },
    { type: "walk", duration: 240 }, { type: "jog", duration: 60 },
    { type: "walk", duration: 240 }, { type: "jog", duration: 60 },
  ]},
  { name: "Pathfinder", desc: "3 min walk / 2 min jog × 4", intervals: [
    { type: "walk", duration: 180 }, { type: "jog", duration: 120 },
    { type: "walk", duration: 180 }, { type: "jog", duration: 120 },
    { type: "walk", duration: 180 }, { type: "jog", duration: 120 },
    { type: "walk", duration: 180 }, { type: "jog", duration: 120 },
  ]},
  { name: "Strider", desc: "2 min walk / 3 min jog × 4", intervals: [
    { type: "walk", duration: 120 }, { type: "jog", duration: 180 },
    { type: "walk", duration: 120 }, { type: "jog", duration: 180 },
    { type: "walk", duration: 120 }, { type: "jog", duration: 180 },
    { type: "walk", duration: 120 }, { type: "jog", duration: 180 },
  ]},
  { name: "Ranger", desc: "1 min walk / 4 min jog × 4", intervals: [
    { type: "walk", duration: 60 }, { type: "jog", duration: 240 },
    { type: "walk", duration: 60 }, { type: "jog", duration: 240 },
    { type: "walk", duration: 60 }, { type: "jog", duration: 240 },
    { type: "walk", duration: 60 }, { type: "jog", duration: 240 },
  ]},
  { name: "Wayfarer", desc: "30s walk / 4.5 min jog × 4", intervals: [
    { type: "walk", duration: 30 }, { type: "jog", duration: 270 },
    { type: "walk", duration: 30 }, { type: "jog", duration: 270 },
    { type: "walk", duration: 30 }, { type: "jog", duration: 270 },
    { type: "walk", duration: 30 }, { type: "jog", duration: 270 },
  ]},
  { name: "Trailblazer", desc: "20 min continuous jog", intervals: [
    { type: "jog", duration: 1200 },
  ]},
];

export default function ExploreTheLandFlow({ onBack }) {
  const [step, setStep] = useState("prep"); // prep, tierSelect, active, effort, done
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0); // index into TIERS
  const [effortRating, setEffortRating] = useState(null);

  // Timer state — background-safe using Date.now()
  const [startTime, setStartTime] = useState(null);
  const [currentIntervalIdx, setCurrentIntervalIdx] = useState(0);
  const [intervalStartTime, setIntervalStartTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const tickRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Walk/Jog 20min"];
  const quote = getRandomQuote("Walk/Jog 20min");
  const tier = TIERS[selectedTier];
  const currentInterval = tier.intervals[currentIntervalIdx];
  const totalDuration = tier.intervals.reduce((s, i) => s + i.duration, 0);

  // Background-safe timer tick
  useEffect(() => {
    if (step !== "active" || finished) return;
    const tick = () => {
      if (!intervalStartTime) return;
      const elapsed = Math.floor((Date.now() - intervalStartTime) / 1000);
      const remaining = Math.max(0, currentInterval.duration - elapsed);
      setDisplayTime(remaining);

      if (remaining <= 0) {
        // Move to next interval or finish
        if (currentIntervalIdx < tier.intervals.length - 1) {
          setCurrentIntervalIdx(prev => prev + 1);
          setIntervalStartTime(Date.now());
        } else {
          setFinished(true);
        }
      }
    };
    tick(); // immediate
    tickRef.current = setInterval(tick, 500); // check every 500ms for snappier recovery
    return () => clearInterval(tickRef.current);
  }, [step, intervalStartTime, currentIntervalIdx, finished]);

  // Update displayTime when interval changes
  useEffect(() => {
    if (step === "active" && currentInterval) {
      setDisplayTime(currentInterval.duration);
    }
  }, [currentIntervalIdx]);

  const startWorkout = () => {
    const now = Date.now();
    setStartTime(now);
    setIntervalStartTime(now);
    setCurrentIntervalIdx(0);
    setFinished(false);
    setStep("active");
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Total elapsed across all intervals
  const getTotalElapsed = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const BgLayer = () => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/explore-bg.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      opacity: 0.2, pointerEvents: "none", zIndex: 0,
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
      emoji: "🏹",
      title: "Explore the Land",
      body: "Every great thinker walked. Nietzsche, Thoreau, Darwin, Beethoven — they all did their clearest thinking on their feet. This isn't cardio. It's clarity.",
      accent: null,
    },
    {
      emoji: "🌄",
      title: "Walk. Then Jog. Then Run.",
      body: "You'll follow an interval program that starts easy and builds over time. Walk when it says walk. Jog when it says jog. The app guides you — even if your phone is in your pocket.",
      accent: null,
    },
    {
      emoji: "📈",
      title: "Progression Tiers",
      body: "Start as a Scout — mostly walking with short jogs. As you get stronger, advance through Pathfinder, Strider, Ranger, Wayfarer, and finally Trailblazer: 20 minutes of continuous running.",
      accent: "Start where you are. Not where you think you should be.",
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
              <button onClick={() => setStep("tierSelect")} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: "#22c55e", color: "#000",
              }}>Choose Your Tier</button>
            ) : (
              <button onClick={() => setPrepSlide(prepSlide + 1)} style={btnPrimary}>Next</button>
            )}
            <button onClick={() => setShowWhy(true)} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: "#ef4444", color: "#000",
            }}>Not Now</button>
          </div>

          {/* Exit gate */}
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
                    boxShadow: "0 4px 20px rgba(0,0,0,0.6)", marginBottom: 12,
                  }}>
                    <img src="/Nietzsche.png" alt="Nietzsche" style={{
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
                  Your couch is comfortable. Your phone is warm. The door is heavy. Every part of you wants to stay exactly where you are — and that is precisely why you need to move.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  Walking is the oldest form of human thinking. Before chairs, before screens, before walls — we thought on our feet. The greatest ideas in history arrived mid-stride, not mid-scroll.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  Twenty minutes. You will come back clearer, calmer, and more alive than when you left. That is not a promise — it is a guarantee backed by every philosopher who ever laced up their boots and walked into the unknown.
                </p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>
                  Step outside. The land is waiting.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => { setShowWhy(false); setStep("tierSelect"); }} style={{
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

  // ── TIER SELECT ──
  if (step === "tierSelect") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("prep")} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 24, padding: 0,
          }}>← Back</button>

          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Choose Your Tier</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20 }}>How hard are you going?</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map((t, i) => (
              <div key={i} onClick={() => setSelectedTier(i)} style={{
                padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                background: selectedTier === i ? `rgba(240, 178, 50, 0.1)` : C.card,
                border: selectedTier === i ? `2px solid ${C.gold}` : `1px solid ${C.cardBorder}`,
                transition: "all 0.2s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: selectedTier === i ? C.gold : C.text }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{t.desc}</div>
                  </div>
                  {selectedTier === i && <span style={{ fontSize: 18, color: C.gold }}>✓</span>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={startWorkout} style={{
            width: "100%", padding: "18px", borderRadius: 12, border: "none",
            cursor: "pointer", fontSize: 16, fontWeight: 700,
            background: "#22c55e", color: "#000", marginTop: 20,
          }}>
            Start — {tier.name}
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE TIMER ──
  if (step === "active") {
    const isJog = currentInterval?.type === "jog";
    const intervalProgress = currentInterval ? ((currentInterval.duration - displayTime) / currentInterval.duration) * 100 : 0;
    const totalProgress = Math.min((getTotalElapsed() / totalDuration) * 100, 100);

    if (finished) {
      // Auto-advance to effort rating
      setTimeout(() => setStep("effort"), 500);
    }

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 120px", position: "relative",
        background: isJog ? "#0a1a0a" : "#0a0e17",
        transition: "background 1s ease",
      }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>

          {/* Interval indicator */}
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 2, marginBottom: 8 }}>
            {currentIntervalIdx + 1} / {tier.intervals.length}
          </div>

          {/* Phase label — big */}
          <div style={{
            fontSize: 48, fontWeight: 900, fontFamily: "'Cinzel', serif",
            color: isJog ? "#22c55e" : C.text,
            textShadow: isJog ? "0 0 30px rgba(34, 197, 94, 0.3)" : "none",
            transition: "color 0.5s ease",
            marginBottom: 8,
          }}>
            {isJog ? "JOG" : "WALK"}
          </div>

          {/* Timer */}
          <div style={{
            fontSize: 64, fontWeight: 800, fontFamily: "monospace",
            color: displayTime <= 5 ? "#f59e0b" : C.text,
            marginBottom: 16,
            transition: "color 0.3s ease",
          }}>
            {formatTime(displayTime)}
          </div>

          {/* Interval progress bar */}
          <div style={{
            width: 280, height: 6, background: C.surfaceLight, borderRadius: 3,
            overflow: "hidden", margin: "0 auto 24px",
          }}>
            <div style={{
              width: `${intervalProgress}%`, height: "100%", borderRadius: 3,
              background: isJog ? "#22c55e" : C.gold,
              transition: "width 0.5s linear",
            }} />
          </div>

          {/* Next up preview */}
          {currentIntervalIdx < tier.intervals.length - 1 && (
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 16 }}>
              Next: <span style={{ color: tier.intervals[currentIntervalIdx + 1].type === "jog" ? "#22c55e" : C.text, fontWeight: 600 }}>
                {tier.intervals[currentIntervalIdx + 1].type.toUpperCase()}
              </span> — {formatTime(tier.intervals[currentIntervalIdx + 1].duration)}
            </div>
          )}

          {/* Total progress */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>Overall progress</div>
            <div style={{
              width: 280, height: 4, background: C.surfaceLight, borderRadius: 2,
              overflow: "hidden", margin: "0 auto",
            }}>
              <div style={{
                width: `${totalProgress}%`, height: "100%", borderRadius: 2,
                background: `linear-gradient(90deg, ${C.gold}, #22c55e)`,
                transition: "width 1s linear",
              }} />
            </div>
          </div>

          {/* Tier name */}
          <div style={{
            position: "absolute", bottom: -40,
            left: 0, right: 0, textAlign: "center",
            fontSize: 11, color: C.textDim, letterSpacing: 2, textTransform: "uppercase",
          }}>
            {tier.name}
          </div>
        </div>
      </div>
    );
  }

  // ── EFFORT RATING ──
  if (step === "effort") {
    const ratings = [
      { label: "Easy", emoji: "😎", color: "#22c55e" },
      { label: "Moderate", emoji: "💪", color: "#f59e0b" },
      { label: "Hard", emoji: "🔥", color: "#ef4444" },
      { label: "All Out", emoji: "💀", color: "#a855f7" },
    ];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏹</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 8 }}>
            How was that?
          </div>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>
            Rate your effort. Be honest — this helps us know when you're ready to level up.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 32 }}>
            {ratings.map((r, i) => (
              <div key={i} onClick={() => setEffortRating(r.label)} style={{
                padding: "14px 8px", borderRadius: 14, cursor: "pointer",
                background: effortRating === r.label ? `${r.color}22` : C.card,
                border: effortRating === r.label ? `2px solid ${r.color}` : `1px solid ${C.cardBorder}`,
                flex: 1, textAlign: "center", transition: "all 0.2s ease",
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{r.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: effortRating === r.label ? r.color : C.textMuted }}>{r.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep("done")} disabled={!effortRating} style={{
            ...btnPrimary,
            background: effortRating ? "#22c55e" : C.surfaceLight,
            color: effortRating ? "#000" : C.textDim,
            cursor: effortRating ? "pointer" : "default",
          }}>
            Continue
          </button>
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
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏹</div>
          <div style={{
            fontSize: 48, color: C.ritualDone, fontWeight: 800,
            fontFamily: "'Cinzel', serif", marginBottom: 8,
          }}>✓</div>
          <div style={{
            fontSize: 20, color: C.ritualDone, fontWeight: 700, marginBottom: 8,
          }}>Ritual Complete!</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>
            {tier.name} tier conquered{effortRating ? ` — rated ${effortRating.toLowerCase()}` : ""}
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
