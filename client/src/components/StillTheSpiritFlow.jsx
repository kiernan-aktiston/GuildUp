import { useState, useEffect, useRef } from "react";
import { C, getRandomQuote } from "../constants";

const PURPLE = "#6b4a8c";
const PURPLE_DIM = "#4a3562";
const PURPLE_FAINT = "rgba(107, 74, 140, 0.08)";
const PURPLE_LIGHT = "#a78bfa";
const MONO = "'Courier New', 'Consolas', monospace";

const TIERS = [
  { name: "First Flame", code: "FF-01", duration: 300, xp: 10, gold: 2, reqSpi: 0, desc: "5 minutes. Light the first flame." },
  { name: "Stillness", code: "ST-02", duration: 600, xp: 15, gold: 3, reqSpi: 15, desc: "10 minutes. Sit with the silence." },
  { name: "The Void", code: "VD-03", duration: 900, xp: 20, gold: 4, reqSpi: 20, desc: "15 minutes. Enter the dark and stay." },
  { name: "Inner Light", code: "IL-04", duration: 1200, xp: 25, gold: 5, reqSpi: 25, desc: "20 minutes. True stillness. No shortcuts." },
];

const INHALE = 4;
const HOLD = 2;
const EXHALE = 6;
const CYCLE = INHALE + HOLD + EXHALE;

const KHALIL_QUOTES = [
  "You cannot think your way to peace. You have to stop thinking first. Sit down. Breathe.",
  "The desert fathers sat in silence for years. You have ten minutes. Begin.",
  "Stillness is not weakness. It is the deepest kind of readiness.",
  "An operator who cannot quiet the mind will break in the field. This is not optional.",
  "There is something larger than you. Acknowledge it. It changes everything.",
  "The spirit is the last thing to fail. But only if you keep it sharp.",
  "Silence is not empty. It is full of answers. You have to stop talking long enough to hear them.",
];

function CaveBg({ opacity = 1 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "url(/sanctum-cave.png)", backgroundSize: "cover", backgroundPosition: "center",
      opacity,
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.95) 100%)" }} />
    </div>
  );
}

function getDaySeed(userId = "") {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear + userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

export default function StillTheSpiritFlow({ onBack, playerStats = {}, userId = "" }) {
  const [step, setStep] = useState("intro1");
  const [showResistance, setShowResistance] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [breathCycle, setBreathCycle] = useState(0);
  const tickRef = useRef(null);

  const quote = getRandomQuote("Pray/Meditate 10min");
  const khalilQuote = KHALIL_QUOTES[getDaySeed(userId) % KHALIL_QUOTES.length];
  const tier = TIERS[selectedTier];
  const spiLevel = playerStats.spi || 10;

  useEffect(() => {
    if (step !== "meditate" || !startTime || finished) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, tier.duration - elapsed);
      setDisplayTime(remaining);
      const cyclePos = elapsed % CYCLE;
      setBreathCycle(cyclePos);
      if (cyclePos < INHALE) setBreathPhase("inhale");
      else if (cyclePos < INHALE + HOLD) setBreathPhase("hold");
      else setBreathPhase("exhale");
      if (remaining <= 0) { setFinished(true); clearInterval(tickRef.current); }
    };
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [step, startTime, finished]);

  const startMeditation = () => {
    setStartTime(Date.now()); setFinished(false);
    setDisplayTime(tier.duration); setStep("meditate");
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60); const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getBreathScale = () => {
    if (breathPhase === "inhale") return 1.0 + (breathCycle / INHALE) * 0.4;
    if (breathPhase === "hold") return 1.4;
    return 1.4 - ((breathCycle - INHALE - HOLD) / EXHALE) * 0.4;
  };

  const getBreathLabel = () => {
    if (breathPhase === "inhale") return "Breathe in";
    if (breathPhase === "hold") return "Hold";
    return "Breathe out";
  };

  const breathColor = breathPhase === "inhale" ? PURPLE_LIGHT : breathPhase === "hold" ? "#c4b5fd" : PURPLE;

  // ═══════════════════════════════════════
  // SLIDE 1: THE COMPACT'S MANDATE
  // ═══════════════════════════════════════
  if (step === "intro1") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <CaveBg opacity={0.3} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: PURPLE_DIM, letterSpacing: 3, marginBottom: 32, textTransform: "uppercase" }}>The Compact {"\u2014"} Contractor Protocol</div>

          <div style={{ fontSize: 13, color: C.text, lineHeight: 2, fontFamily: "'Inter', sans-serif", marginBottom: 48 }}>
            Contractors who operate without spiritual discipline become liabilities. The mind fractures under pressure. The spirit anchors it.
            <span style={{ display: "block", height: 16 }} />
            This protocol exists because the Compact has learned what happens when operators neglect the interior.
            <span style={{ display: "block", height: 16 }} />
            <span style={{ color: PURPLE_LIGHT }}>Sit. Breathe. Return to yourself.</span>
          </div>

          <button onClick={() => setStep("intro2")} style={{
            padding: "14px 48px", border: `1px solid ${PURPLE}44`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: PURPLE_LIGHT, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ACKNOWLEDGED ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SLIDE 2: KHALIL INTRODUCTION
  // ═══════════════════════════════════════
  if (step === "intro2") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <CaveBg opacity={0.2} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ marginBottom: 20 }}>
            <img src="/khalil-portrait.png" alt="Khalil" style={{
              width: 160, height: 160, objectFit: "cover", borderRadius: "50%",
              border: `2px solid ${PURPLE}33`,
            }} onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: PURPLE_LIGHT, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>Sanctum Protocol Director</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: 2, marginBottom: 20 }}>Khalil</div>

          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 2, fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 40, padding: "0 8px" }}>
            "{khalilQuote}"
          </div>

          <button onClick={() => setStep("tierSelect")} style={{
            padding: "14px 48px", border: `1px solid ${PURPLE}44`, cursor: "pointer",
            background: PURPLE_FAINT, fontFamily: MONO, color: PURPLE_LIGHT, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ENTER THE SANCTUM ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // TIER SELECT
  // ═══════════════════════════════════════
  if (step === "tierSelect") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <CaveBg opacity={0.1} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => onBack(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: MONO }}>{"\u2190"} abort</button>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: PURPLE_DIM, letterSpacing: 2, marginBottom: 8 }}>SANCTUM PROTOCOL</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2 }}>How Long Can You Sit?</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: PURPLE_DIM, marginTop: 6 }}>SPI: {spiLevel}</div>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: PURPLE_DIM, letterSpacing: 1, marginBottom: 12 }}>PROTOCOL TIER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {TIERS.map((t, i) => {
              const locked = spiLevel < t.reqSpi;
              const selected = selectedTier === i;
              return (
                <div key={i} onClick={() => { if (!locked) setSelectedTier(i); }} style={{
                  padding: "14px 16px", cursor: locked ? "default" : "pointer",
                  background: selected && !locked ? PURPLE_FAINT : "transparent",
                  border: `1px solid ${selected && !locked ? PURPLE + '44' : C.border}`,
                  opacity: locked ? 0.3 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: PURPLE_DIM }}>{t.code}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: selected ? PURPLE_LIGHT : C.text }}>{t.name}</span>
                        {locked && <span style={{ fontFamily: MONO, fontSize: 9, color: "#ef4444" }}>LOCKED {"\u2014"} SPI {t.reqSpi}</span>}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 4 }}>{Math.floor(t.duration / 60)}min {"\u00B7"} {t.xp}xp {"\u00B7"} {t.gold}g</div>
                    </div>
                    {selected && !locked && <span style={{ fontFamily: MONO, fontSize: 14, color: PURPLE_LIGHT }}>{"\u25C9"}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={startMeditation} style={{
            width: "100%", padding: "16px", border: `1px solid ${PURPLE}55`, cursor: "pointer",
            background: PURPLE_FAINT, fontFamily: MONO, color: PURPLE_LIGHT, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ BEGIN {"\u2014"} {tier.name.toUpperCase()} ]</button>

          <button onClick={() => setShowResistance(true)} style={{
            width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, marginTop: 8, borderRadius: 0,
          }}>[ NOT TODAY ]</button>

          {showResistance && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${PURPLE_DIM}44` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: PURPLE_DIM, letterSpacing: 1, marginBottom: 16 }}>KHALIL:</div>
                <div style={{ fontSize: 13, color: PURPLE_LIGHT, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  You feel restless. Good. That restlessness is the signal, not the obstacle. The mind resists stillness because stillness shows you what you've been avoiding.
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  Five minutes. Just five minutes of breathing. You'll be different on the other side.
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: PURPLE_LIGHT, fontWeight: 600, marginBottom: 20 }}>
                  Be still. Be here.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { setShowResistance(false); startMeditation(); }} style={{ width: "100%", padding: "14px", border: `1px solid ${PURPLE}55`, cursor: "pointer", background: PURPLE_FAINT, fontFamily: MONO, color: PURPLE_LIGHT, fontSize: 13, fontWeight: 600, borderRadius: 0 }}>[ BEGIN ]</button>
                  <button onClick={() => { setShowResistance(false); onBack(false); }} style={{ width: "100%", padding: "12px", border: `1px solid #ef444444`, cursor: "pointer", background: "transparent", fontFamily: MONO, color: "#ef4444", fontSize: 12, borderRadius: 0 }}>[ STAND DOWN ]</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // MEDITATION (breathing pacer)
  // ═══════════════════════════════════════
  if (step === "meditate") {
    const scale = getBreathScale();
    const progress = startTime ? Math.min((Date.now() - startTime) / (tier.duration * 1000), 1) : 0;

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 100px", position: "relative", background: "#000",
      }}>
        <CaveBg opacity={0.45} />
        <div style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)",
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
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: breathColor, letterSpacing: 1 }}>
                {getBreathLabel()}
              </span>
            </div>
          </div>

          {/* Timer */}
          <div style={{
            fontSize: 36, fontWeight: 700, fontFamily: MONO,
            color: "rgba(255,255,255,0.7)", marginBottom: 16,
          }}>{formatTime(displayTime)}</div>

          <div style={{
            fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)",
            maxWidth: 280, margin: "0 auto 24px", lineHeight: 1.6,
          }}>
            {finished ? "The silence has spoken." : "Sync your breathing. Close your eyes when ready."}
          </div>

          {/* Progress bar */}
          <div style={{ width: 200, height: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden", margin: "0 auto 8px" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: PURPLE_LIGHT, transition: "width 1s linear" }} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>{tier.code} {"\u2022"} {tier.name}</div>

          {finished && (
            <button onClick={() => setStep("done")} style={{
              padding: "16px 48px", border: `1px solid ${PURPLE}55`, cursor: "pointer",
              background: PURPLE_FAINT, fontFamily: MONO, color: PURPLE_LIGHT,
              fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0, marginTop: 32,
              animation: "fadeIn 1s ease",
            }}>[ RETURN ]</button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════
  if (step === "done") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <CaveBg opacity={0.2} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: PURPLE_DIM, letterSpacing: 2, marginBottom: 16 }}>SANCTUM COMPLETE</div>

          <div style={{ fontFamily: MONO, fontSize: 48, color: C.green, fontWeight: 700, marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Spirit Readiness: Confirmed</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: PURPLE_LIGHT, marginBottom: 4 }}>{tier.code} {"\u2022"} {tier.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, marginBottom: 20 }}>{Math.floor(tier.duration / 60)} minutes of stillness</div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: PURPLE_LIGHT }}>{tier.xp}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>XP</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.green }}>{tier.gold}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>GOLD</div>
            </div>
          </div>

          <div style={{ padding: "14px 16px", border: `1px solid ${PURPLE_DIM}22`, background: PURPLE_FAINT, marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>"{quote.text}"</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: PURPLE_DIM, marginTop: 6 }}>{"\u2014"} {quote.author}</div>
          </div>

          <button onClick={() => onBack(true, { xp: tier.xp, gold: tier.gold })} style={{
            padding: "16px 48px", border: `1px solid ${C.green}55`, cursor: "pointer",
            background: "rgba(74, 124, 80, 0.1)", fontFamily: MONO, color: C.green,
            fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ LOG SESSION {"\u2014"} +{tier.xp} XP ]</button>
        </div>
      </div>
    );
  }

  return null;
}