import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const TIERS = [
  { name: "First Steps", emoji: "\u{1F9AD}", duration: 600, type: "Walk", xp: 10, gold: 2, reqAgi: 0, desc: "10 minutes on your feet. Build the habit.", distMiles: "~0.5 mi" },
  { name: "The Long Road", emoji: "\u{1F6E4}\uFE0F", duration: 1200, type: "Walk", xp: 15, gold: 3, reqAgi: 15, desc: "20 minutes. Commit to the journey.", distMiles: "~1.0 mi" },
  { name: "Quickened Pace", emoji: "\u{1F3C3}", duration: 600, type: "Jog / Run", xp: 20, gold: 4, reqAgi: 20, desc: "10 minutes of real effort. Short but intense.", distMiles: "~0.8 mi" },
  { name: "Horizon Chase", emoji: "\u{1F525}", duration: 1200, type: "Jog / Run", xp: 25, gold: 5, reqAgi: 25, desc: "20 minutes of running. This is where legends are made.", distMiles: "~1.7 mi" },
];

const MID_MESSAGES = [
  { at: 0.0, text: "You're moving. That's what matters." },
  { at: 0.25, text: "Keep going. Don't think, just move." },
  { at: 0.5, text: "Halfway. You're stronger than the voice telling you to stop." },
  { at: 0.75, text: "Almost there. Finish what you started." },
  { at: 0.9, text: "The end is in sight. Don't slow down now." },
];

export default function ExploreTheLandFlow({ onBack, playerStats = {} }) {
  const [step, setStep] = useState("prep");
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [effortRating, setEffortRating] = useState(null);

  // Background-safe timer
  const [startTime, setStartTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const tickRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Walk/Jog 20min"];
  const quote = getRandomQuote("Walk/Jog 20min");
  const tier = TIERS[selectedTier];
  const agiLevel = playerStats.agi || 10;

  // Timer tick — background safe
  useEffect(() => {
    if (step !== "active" || !startTime || finished) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, tier.duration - elapsed);
      setDisplayTime(remaining);
      if (remaining <= 0) {
        setFinished(true);
        clearInterval(tickRef.current);
      }
    };
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [step, startTime, finished]);

  const startTimer = () => {
    setStartTime(Date.now());
    setFinished(false);
    setDisplayTime(tier.duration);
    setStep("active");
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!startTime) return 0;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.min(elapsed / tier.duration, 1);
  };

  const getMessage = () => {
    const progress = getProgress();
    let msg = MID_MESSAGES[0].text;
    for (const m of MID_MESSAGES) {
      if (progress >= m.at) msg = m.text;
    }
    return msg;
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
    { emoji: "\u{1F3F9}", title: "Explore the Land", body: "Every great thinker walked. Nietzsche, Thoreau, Darwin, Beethoven \u2014 they all did their clearest thinking on their feet. This isn't just cardio. It's clarity.", accent: null },
    { emoji: "\u{1F304}", title: "Pick Your Pace", body: "Four tiers. Walk or run, short or long. Start where you are. The only rule is that you move.", accent: "Harder tiers unlock as your Agility grows." },
    { emoji: "\u{1F4F1}", title: "Phone in Your Pocket", body: "Start the timer and go. Put your phone in your pocket \u2014 the timer keeps running even if your screen locks. Come back when you feel the buzz or check when you're ready.", accent: "The timer will continue even if your phone locks." },
  ];
  const isLastSlide = prepSlide === slides.length - 1;

  if (step === "prep") {
    const slide = slides[prepSlide];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
          <button onClick={() => { if (prepSlide > 0) setPrepSlide(prepSlide - 1); else onBack(false); }} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>{"\u2190"} Back</button>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {slides.map((_, i) => (<div key={i} onClick={() => setPrepSlide(i)} style={{ width: i === prepSlide ? 24 : 8, height: 8, borderRadius: 4, background: i === prepSlide ? C.gold : C.surfaceLight, transition: "all 0.3s ease", cursor: "pointer" }} />))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeIn 0.25s ease" }} key={prepSlide}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{slide.emoji}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 6 }}>{slide.title}</div>
              {prepSlide === 0 && <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>The Ritual</div>}
            </div>
            <div style={{ padding: "20px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(8px)" }}>
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>{slide.body}</p>
              {slide.accent && <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontStyle: "italic", fontWeight: 600, marginTop: 14 }}>{slide.accent}</p>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            {isLastSlide ? (
              <button onClick={() => setStep("tierSelect")} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "#22c55e", color: "#000" }}>Choose Your Tier</button>
            ) : (
              <button onClick={() => setPrepSlide(prepSlide + 1)} style={btnPrimary}>Next</button>
            )}
            <button onClick={() => setShowWhy(true)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "#ef4444", color: "#000" }}>Not Now</button>
          </div>
          {showWhy && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease", padding: 24, overflowY: "auto" }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, padding: 28, borderRadius: 20, background: C.surface, border: `1px solid ${C.border}`, maxHeight: "85vh", overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", border: `3px solid ${C.gold}44`, background: "radial-gradient(circle, #1a1a2e 60%, #000 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.6)", marginBottom: 12 }}>
                    <img src="/Nietzsche.png" alt="Nietzsche" style={{ width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated", filter: "brightness(1.1)" }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Face the Resistance</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>"{info.featuredQuote.text}"</div>
                    <div style={{ fontSize: 11, color: C.gold }}>{"\u2014"} {info.featuredQuote.author}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>Your couch is comfortable. Your phone is warm. The door is heavy. Every part of you wants to stay exactly where you are {"\u2014"} and that is precisely why you need to move.</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>Walking is the oldest form of human thinking. Before chairs, before screens, before walls {"\u2014"} we thought on our feet.</p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>Step outside. The land is waiting.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => { setShowWhy(false); setStep("tierSelect"); }} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "#22c55e", color: "#000" }}>You're Right {"\u2014"} Let's Go</button>
                  <button onClick={() => { setShowWhy(false); onBack(false); }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "#ef4444", color: "#000" }}>Not Today</button>
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
          <button onClick={() => setStep("prep")} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>{"\u2190"} Back</button>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Choose Your Tier</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>How far are you going?</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Your AGI: <span style={{ color: "#22c55e", fontWeight: 700 }}>{agiLevel}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map((t, i) => {
              const locked = agiLevel < t.reqAgi;
              const selected = selectedTier === i;
              return (
                <div key={i} onClick={() => { if (!locked) setSelectedTier(i); }} style={{
                  padding: "16px 18px", borderRadius: 14, cursor: locked ? "default" : "pointer",
                  background: locked ? C.surfaceLight : selected ? "rgba(240, 178, 50, 0.1)" : C.card,
                  border: selected && !locked ? `2px solid ${C.gold}` : `1px solid ${C.cardBorder}`,
                  opacity: locked ? 0.45 : 1, transition: "all 0.2s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{t.emoji}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: selected ? C.gold : C.text }}>{t.name}</span>
                        {locked && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>{"\u{1F512}"} AGI {t.reqAgi}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{Math.floor(t.duration / 60)} min {t.type} {"\u00B7"} {t.xp} XP {"\u00B7"} {t.gold} gold</div>
                    </div>
                    {selected && !locked && <span style={{ fontSize: 18, color: C.gold }}>{"\u2713"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={startTimer} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, background: "#22c55e", color: "#000", marginTop: 20 }}>Start {"\u2014"} {tier.name}</button>
        </div>
      </div>
    );
  }

  // ── ACTIVE TIMER ──
  if (step === "active") {
    const progress = getProgress();
    const minutesLeft = Math.ceil(displayTime / 60);
    const isJog = tier.type.includes("Jog");

    if (finished && step === "active") {
      setTimeout(() => setStep("effort"), 300);
    }

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 120px", position: "relative",
        background: "#050a05",
      }}>
        {/* Subtle progress ring */}
        <div style={{ position: "relative", width: 220, height: 220, marginBottom: 24 }}>
          <svg viewBox="0 0 220 220" width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="110" cy="110" r="100" fill="none" stroke={C.surfaceLight} strokeWidth="4" />
            <circle cx="110" cy="110" r="100" fill="none"
              stroke={isJog ? "#22c55e" : C.gold}
              strokeWidth="4"
              strokeDasharray={`${progress * 628.3} 628.3`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s linear" }}
            />
          </svg>
          {/* Timer in center of ring */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", textAlign: "center",
          }}>
            <div style={{
              fontSize: 48, fontWeight: 800, fontFamily: "monospace",
              color: C.text,
            }}>{formatTime(displayTime)}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{tier.type}</div>
          </div>
        </div>

        {/* Motivational message */}
        <div style={{
          fontSize: 14, color: C.textMuted, textAlign: "center",
          fontStyle: "italic", maxWidth: 280, lineHeight: 1.6,
          transition: "opacity 0.5s ease",
        }}>{getMessage()}</div>

        {/* Minutes remaining */}
        <div style={{
          position: "absolute", bottom: 80,
          fontSize: 11, color: C.textDim, letterSpacing: 1,
        }}>
          {minutesLeft} {minutesLeft === 1 ? "minute" : "minutes"} remaining
        </div>

        {/* Tier name */}
        <div style={{
          position: "absolute", bottom: 50,
          fontSize: 10, color: C.textDim, letterSpacing: 2, textTransform: "uppercase",
        }}>{tier.name}</div>
      </div>
    );
  }

  // ── EFFORT RATING ──
  if (step === "effort") {
    const ratings = [
      { label: "Easy", emoji: "\u{1F60E}", color: "#22c55e" },
      { label: "Moderate", emoji: "\u{1F4AA}", color: "#f59e0b" },
      { label: "Hard", emoji: "\u{1F525}", color: "#ef4444" },
      { label: "All Out", emoji: "\u{1F480}", color: "#a855f7" },
    ];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F3F9}"}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 8 }}>How was that?</div>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Rate your effort honestly.</p>
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
          }}>Continue</button>
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
          <div style={{ fontSize: 64, marginBottom: 16 }}>{tier.emoji}</div>
          <div style={{ fontSize: 48, color: C.ritualDone, fontWeight: 800, fontFamily: "'Cinzel', serif", marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 20, color: C.ritualDone, fontWeight: 700, marginBottom: 4 }}>Ritual Complete!</div>
          <div style={{ fontSize: 14, color: C.gold, fontWeight: 600, marginBottom: 4 }}>{tier.name} conquered{effortRating ? ` \u2014 rated ${effortRating.toLowerCase()}` : ""}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Estimated distance: {tier.distMiles}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>{tier.xp}</div><div style={{ fontSize: 10, color: C.textDim }}>XP</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{tier.gold}</div><div style={{ fontSize: 10, color: C.textDim }}>Gold</div></div>
          </div>
          <div style={{ padding: "12px 20px", borderRadius: 10, display: "inline-block", background: C.card, border: `1px solid ${C.cardBorder}`, marginBottom: 32 }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>"{quote.text}"</span>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{"\u2014"} {quote.author}</div>
          </div>
          <div>
            <button onClick={() => onBack(true, { xp: tier.xp, gold: tier.gold })} style={{
              padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
              color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
              boxShadow: `0 4px 20px ${C.ritualDone}44`,
            }}>Claim +{tier.xp} XP</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}