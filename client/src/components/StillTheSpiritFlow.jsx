import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const TIERS = [
  { name: "First Flame", emoji: "\u{1F56F}\uFE0F", duration: 300, xp: 10, gold: 2, reqSpi: 0, desc: "5 minutes. Light the first flame." },
  { name: "Stillness", emoji: "\u{1F9D8}", duration: 600, xp: 15, gold: 3, reqSpi: 15, desc: "10 minutes. Sit with the silence." },
  { name: "The Void", emoji: "\u{1F311}", duration: 900, xp: 20, gold: 4, reqSpi: 20, desc: "15 minutes. Enter the dark and stay." },
  { name: "Inner Light", emoji: "\u2728", duration: 1200, xp: 25, gold: 5, reqSpi: 25, desc: "20 minutes. True stillness. No shortcuts." },
];

const INHALE = 4;
const HOLD = 2;
const EXHALE = 6;
const CYCLE = INHALE + HOLD + EXHALE;

export default function StillTheSpiritFlow({ onBack, playerStats = {} }) {
  const [step, setStep] = useState("prep");
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);

  // Background-safe timer
  const [startTime, setStartTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [breathCycle, setBreathCycle] = useState(0);
  const tickRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Pray/Meditate 10min"];
  const quote = getRandomQuote("Pray/Meditate 10min");
  const tier = TIERS[selectedTier];
  const spiLevel = playerStats.spi || 10;

  // Background-safe timer + breathing
  useEffect(() => {
    if (step !== "meditate" || !startTime || finished) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, tier.duration - elapsed);
      setDisplayTime(remaining);

      // Breathing cycle based on elapsed time
      const cyclePos = elapsed % CYCLE;
      setBreathCycle(cyclePos);
      if (cyclePos < INHALE) setBreathPhase("inhale");
      else if (cyclePos < INHALE + HOLD) setBreathPhase("hold");
      else setBreathPhase("exhale");

      if (remaining <= 0) {
        setFinished(true);
        clearInterval(tickRef.current);
      }
    };
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [step, startTime, finished]);

  const startMeditation = () => {
    setStartTime(Date.now());
    setFinished(false);
    setDisplayTime(tier.duration);
    setStep("meditate");
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getBreathScale = () => {
    if (breathPhase === "inhale") return 1.0 + (breathCycle / INHALE) * 0.4;
    if (breathPhase === "hold") return 1.4;
    const exhaleProgress = (breathCycle - INHALE - HOLD) / EXHALE;
    return 1.4 - exhaleProgress * 0.4;
  };

  const getBreathLabel = () => {
    if (breathPhase === "inhale") return "Breathe in";
    if (breathPhase === "hold") return "Hold";
    return "Breathe out";
  };

  const breathColor = breathPhase === "inhale" ? "#a78bfa" : breathPhase === "hold" ? "#c4b5fd" : "#7c3aed";

  const BgLayer = ({ opacity = 0.4 }) => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/spirit-bg.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      opacity, pointerEvents: "none", zIndex: 0,
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
    { emoji: "\u{1F56F}\uFE0F", title: "Still the Spirit", body: "The world is loud. Your mind is louder. Stillness is not the absence of noise \u2014 it is the practice of not following it.", accent: null },
    { emoji: "\u{1F9D8}", title: "Choose Your Duration", body: "Four tiers. Five minutes to build the habit. Twenty minutes for those who've learned to sit with themselves. Start where you are.", accent: "Longer tiers unlock as your Spirit grows." },
    { emoji: "\u{1F4F1}", title: "How It Works", body: "A breathing pacer will guide you. Sync your breathing to the rhythm. When you feel ready, close your eyes. Open them anytime you need to find the rhythm again.", accent: "The timer will continue even if your phone locks." },
  ];
  const isLastSlide = prepSlide === slides.length - 1;

  if (step === "prep") {
    const slide = slides[prepSlide];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        <BgLayer opacity={0.2} />
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
                    <img src="/Lao-Tzu.png" alt="Lao Tzu" style={{ width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated", filter: "brightness(1.1)" }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Face the Resistance</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>"{info.featuredQuote.text}"</div>
                    <div style={{ fontSize: 11, color: C.gold }}>{"\u2014"} {info.featuredQuote.author}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>You feel restless. Good. That restlessness is the signal, not the obstacle. The mind resists stillness because stillness shows you what you've been avoiding.</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>Five minutes. Just five minutes of breathing. You'll feel different on the other side.</p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>Be still. Be here.</p>
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
        <BgLayer opacity={0.2} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("prep")} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>{"\u2190"} Back</button>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Choose Your Tier</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>How long can you sit?</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Your SPI: <span style={{ color: "#a78bfa", fontWeight: 700 }}>{spiLevel}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map((t, i) => {
              const locked = spiLevel < t.reqSpi;
              const selected = selectedTier === i;
              return (
                <div key={i} onClick={() => { if (!locked) setSelectedTier(i); }} style={{
                  padding: "16px 18px", borderRadius: 14, cursor: locked ? "default" : "pointer",
                  background: locked ? C.surfaceLight : selected ? "rgba(167, 139, 250, 0.1)" : C.card,
                  border: selected && !locked ? "2px solid #a78bfa" : `1px solid ${C.cardBorder}`,
                  opacity: locked ? 0.45 : 1, transition: "all 0.2s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{t.emoji}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: selected ? "#a78bfa" : C.text }}>{t.name}</span>
                        {locked && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>{"\u{1F512}"} SPI {t.reqSpi}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{Math.floor(t.duration / 60)} min {"\u00B7"} {t.xp} XP {"\u00B7"} {t.gold} gold</div>
                    </div>
                    {selected && !locked && <span style={{ fontSize: 18, color: "#a78bfa" }}>{"\u2713"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={startMeditation} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, background: "#a78bfa", color: "#000", marginTop: 20 }}>Begin {"\u2014"} {tier.name}</button>
        </div>
      </div>
    );
  }

  // ── MEDITATION (breathing pacer stays visible) ──
  if (step === "meditate") {
    const scale = getBreathScale();
    const progress = startTime ? Math.min((Date.now() - startTime) / (tier.duration * 1000), 1) : 0;

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 120px", position: "relative",
        background: "#000",
      }}>
        {/* Background image at higher opacity */}
        <BgLayer opacity={0.4} />

        {/* Dark gradient overlay for text readability */}
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, height: "100vh",
          background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none", zIndex: 1,
        }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", width: "100%" }}>
          {/* Breathing circle */}
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            background: `radial-gradient(circle, ${breathColor}33 0%, transparent 70%)`,
            border: `2px solid ${breathColor}88`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            transform: `scale(${scale})`,
            transition: "transform 0.5s ease, border-color 0.5s ease, background 0.5s ease",
            boxShadow: `0 0 40px ${breathColor}22`,
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: `radial-gradient(circle, ${breathColor}44 0%, transparent 70%)`,
              border: `1px solid ${breathColor}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.5s ease",
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: breathColor, letterSpacing: 1 }}>
                {getBreathLabel()}
              </span>
            </div>
          </div>

          {/* Timer */}
          <div style={{
            fontSize: 36, fontWeight: 700, fontFamily: "monospace",
            color: "rgba(255,255,255,0.7)", marginBottom: 16,
          }}>{formatTime(displayTime)}</div>

          {/* Instruction */}
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic",
            maxWidth: 280, margin: "0 auto 24px", lineHeight: 1.6,
          }}>
            {finished ? "The silence has spoken." : "Sync your breathing to the rhythm. When you feel ready, close your eyes. Open them anytime you need to find the rhythm again."}
          </p>

          {/* Progress bar — very subtle */}
          <div style={{
            width: 200, height: 2, background: "rgba(255,255,255,0.1)",
            borderRadius: 1, overflow: "hidden", margin: "0 auto 8px",
          }}>
            <div style={{
              width: `${progress * 100}%`, height: "100%", borderRadius: 1,
              background: `linear-gradient(90deg, #a78bfa, #c4b5fd)`,
              transition: "width 1s linear",
            }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>{tier.name}</div>

          {/* Done button */}
          {finished && (
            <button onClick={() => setStep("done")} style={{
              padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "#a78bfa", color: "#000",
              fontSize: 16, fontWeight: 700, marginTop: 32,
              animation: "fadeIn 1s ease",
            }}>Return</button>
          )}
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (step === "done") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.5s ease" }}>
        <BgLayer opacity={0.25} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{tier.emoji}</div>
          <div style={{ fontSize: 48, color: C.ritualDone, fontWeight: 800, fontFamily: "'Cinzel', serif", marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 20, color: C.ritualDone, fontWeight: 700, marginBottom: 4 }}>Ritual Complete!</div>
          <div style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600, marginBottom: 8 }}>{tier.name} {"\u2014"} {Math.floor(tier.duration / 60)} minutes of stillness</div>
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