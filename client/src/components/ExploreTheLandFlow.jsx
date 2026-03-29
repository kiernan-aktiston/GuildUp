import { useState, useEffect, useRef } from "react";
import { C, getRandomQuote } from "../constants";

const GREEN = "#5a7a5a";
const GREEN_DIM = "#3a5a3a";
const GREEN_FAINT = "rgba(90, 122, 90, 0.08)";
const GREEN_LIGHT = "#7aaa7a";
const MONO = "'Courier New', 'Consolas', monospace";
const TEXTBOX = { background: "rgba(0,0,0,0.7)", padding: "20px 22px", border: "1px solid rgba(90,122,90,0.25)" };

const TIERS = [
  { name: "First Steps", code: "FS-01", duration: 600, type: "Walk", xp: 10, gold: 2, reqAgi: 0, desc: "10 minutes on your feet. Build the habit.", distMiles: "~0.5 mi" },
  { name: "The Long Road", code: "LR-02", duration: 1200, type: "Walk", xp: 15, gold: 3, reqAgi: 15, desc: "20 minutes. Commit to the journey.", distMiles: "~1.0 mi" },
  { name: "Quickened Pace", code: "QP-03", duration: 600, type: "Jog / Run", xp: 20, gold: 4, reqAgi: 20, desc: "10 minutes of real effort. Short but intense.", distMiles: "~0.8 mi" },
  { name: "Horizon Chase", code: "HC-04", duration: 1200, type: "Jog / Run", xp: 25, gold: 5, reqAgi: 25, desc: "20 minutes of running. This is where legends are made.", distMiles: "~1.7 mi" },
];

const MID_MESSAGES = [
  { at: 0.0, text: "You're moving. That's what matters." },
  { at: 0.25, text: "Keep going. Don't think, just move." },
  { at: 0.5, text: "Halfway. You're stronger than the voice telling you to stop." },
  { at: 0.75, text: "Almost there. Finish what you started." },
  { at: 0.9, text: "The end is in sight. Don't slow down now." },
];

const KAYA_QUOTES = [
  "You've walked this route a hundred times and never once looked up. Today, look up.",
  "Every street is a supply line. Every alley is an exit. Learn them before you need them.",
  "The territory doesn't care about your map. Walk it. Know it. That's the only way.",
  "An operator who doesn't know the ground is already lost.",
  "Move through your city like it's hostile territory. Because someday it might be.",
  "Recon isn't exercise. It's survival intelligence gathered on foot.",
  "The land tells you things if you stop and listen. Start walking.",
];

function RidgeBg({ opacity = 1 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "url(/recon-ridge.png)", backgroundSize: "cover", backgroundPosition: "center",
      opacity,
    }} />
  );
}

function getDaySeed(userId = "") {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear + userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

export default function ExploreTheLandFlow({ onBack, playerStats = {}, userId = "" }) {
  const [step, setStep] = useState("intro1");
  const [showResistance, setShowResistance] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [effortRating, setEffortRating] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const tickRef = useRef(null);

  const quote = getRandomQuote("Walk/Jog 20min");
  const kayaQuote = KAYA_QUOTES[getDaySeed(userId) % KAYA_QUOTES.length];
  const tier = TIERS[selectedTier];
  const agiLevel = playerStats.agi || 10;

  useEffect(() => {
    if (step !== "active" || !startTime || finished) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, tier.duration - elapsed);
      setDisplayTime(remaining);
      if (remaining <= 0) { setFinished(true); clearInterval(tickRef.current); }
    };
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [step, startTime, finished]);

  const startTimer = () => { setStartTime(Date.now()); setFinished(false); setDisplayTime(tier.duration); setStep("active"); };
  const formatTime = (s) => { const min = Math.floor(s / 60); const sec = s % 60; return `${min}:${sec.toString().padStart(2, '0')}`; };
  const getProgress = () => { if (!startTime) return 0; return Math.min((Date.now() - startTime) / (tier.duration * 1000), 1); };
  const getMessage = () => { const p = getProgress(); let msg = MID_MESSAGES[0].text; for (const m of MID_MESSAGES) { if (p >= m.at) msg = m.text; } return msg; };

  // ═══════════════════════════════════════
  // SLIDE 1: THE COMPACT'S MANDATE
  // ═══════════════════════════════════════
  if (step === "intro1") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <RidgeBg opacity={0.7} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_LIGHT, letterSpacing: 3, marginBottom: 32, textTransform: "uppercase", fontWeight: 700 }}>The Compact {"\u2014"} Contractor Protocol</div>

          <div style={{ ...TEXTBOX, fontSize: 14, color: "#fff", lineHeight: 2, fontFamily: "'Inter', sans-serif", fontWeight: 500, marginBottom: 36 }}>
            An operator who does not know the ground is already compromised. Territorial awareness is not optional.
            <span style={{ display: "block", height: 16 }} />
            The Compact requires regular reconnaissance of your operating environment. Walk it. Map it. Know it.
            <span style={{ display: "block", height: 16 }} />
            <span style={{ color: GREEN_LIGHT, fontWeight: 700 }}>Move out. Report what you find.</span>
          </div>

          <button onClick={() => setStep("intro2")} style={{
            padding: "14px 48px", border: `1px solid ${GREEN}44`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: GREEN_LIGHT, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ACKNOWLEDGED ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SLIDE 2: KAYA INTRODUCTION
  // ═══════════════════════════════════════
  if (step === "intro2") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <RidgeBg opacity={0.6} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ marginBottom: 20 }}>
            <img src="/kaya-portrait.png" alt="Kaya" style={{
              width: 160, height: 160, objectFit: "cover", borderRadius: "50%",
              border: `2px solid ${GREEN}33`,
            }} onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_LIGHT, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>Recon Protocol Director</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: 2, marginBottom: 20 }}>Kaya</div>

          <div style={{ ...TEXTBOX, fontSize: 14, color: "#ddd", lineHeight: 2, fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 40, border: `1px solid ${GREEN}33` }}>
            "{kayaQuote}"
          </div>

          <button onClick={() => setStep("tierSelect")} style={{
            padding: "14px 48px", border: `1px solid ${GREEN}44`, cursor: "pointer",
            background: GREEN_FAINT, fontFamily: MONO, color: GREEN_LIGHT, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ STEP OUTSIDE ]</button>
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
        <RidgeBg opacity={0.7} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => onBack(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: MONO }}>{"\u2190"} abort</button>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_DIM, letterSpacing: 2, marginBottom: 8 }}>RECON PROTOCOL</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2 }}>How Far Are You Going?</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: GREEN_DIM, marginTop: 6 }}>AGI: {agiLevel}</div>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_DIM, letterSpacing: 1, marginBottom: 12 }}>PROTOCOL TIER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {TIERS.map((t, i) => {
              const locked = agiLevel < t.reqAgi;
              const selected = selectedTier === i;
              return (
                <div key={i} onClick={() => { if (!locked) setSelectedTier(i); }} style={{
                  padding: "14px 16px", cursor: locked ? "default" : "pointer",
                  background: selected && !locked ? GREEN_FAINT : "transparent",
                  border: `1px solid ${selected && !locked ? GREEN + '44' : C.border}`,
                  opacity: locked ? 0.3 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: GREEN_DIM }}>{t.code}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: selected ? GREEN_LIGHT : C.text }}>{t.name}</span>
                        {locked && <span style={{ fontFamily: MONO, fontSize: 9, color: "#ef4444" }}>LOCKED {"\u2014"} AGI {t.reqAgi}</span>}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 4 }}>{Math.floor(t.duration / 60)}min {t.type} {"\u00B7"} {t.distMiles} {"\u00B7"} {t.xp}xp {"\u00B7"} {t.gold}g</div>
                    </div>
                    {selected && !locked && <span style={{ fontFamily: MONO, fontSize: 14, color: GREEN_LIGHT }}>{"\u25C9"}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={startTimer} style={{
            width: "100%", padding: "16px", border: `1px solid ${GREEN}55`, cursor: "pointer",
            background: GREEN_FAINT, fontFamily: MONO, color: GREEN_LIGHT, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ BEGIN {"\u2014"} {tier.name.toUpperCase()} ]</button>

          <button onClick={() => setShowResistance(true)} style={{
            width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, marginTop: 8, borderRadius: 0,
          }}>[ NOT TODAY ]</button>

          {showResistance && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${GREEN_DIM}44` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_DIM, letterSpacing: 1, marginBottom: 16 }}>KAYA:</div>
                <div style={{ fontSize: 13, color: GREEN_LIGHT, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  Your couch is comfortable. Your phone is warm. The door is heavy. Every part of you wants to stay exactly where you are.
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  That is precisely why you need to move. The land won't come to you.
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: GREEN_LIGHT, fontWeight: 600, marginBottom: 20 }}>
                  Step outside. The ridge is waiting.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { setShowResistance(false); startTimer(); }} style={{ width: "100%", padding: "14px", border: `1px solid ${GREEN}55`, cursor: "pointer", background: GREEN_FAINT, fontFamily: MONO, color: GREEN_LIGHT, fontSize: 13, fontWeight: 600, borderRadius: 0 }}>[ MOVE OUT ]</button>
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
  // ACTIVE TIMER
  // ═══════════════════════════════════════
  if (step === "active") {
    const progress = getProgress();
    const minutesLeft = Math.ceil(displayTime / 60);
    const isJog = tier.type.includes("Jog");

    if (finished) { setTimeout(() => setStep("effort"), 300); }

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 100px", position: "relative", background: "#000",
      }}>
        <RidgeBg opacity={0.7} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* Progress ring */}
          <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 24px" }}>
            <svg viewBox="0 0 220 220" width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="110" cy="110" r="100" fill="none" stroke={C.surfaceLight} strokeWidth="4" />
              <circle cx="110" cy="110" r="100" fill="none"
                stroke={isJog ? GREEN_LIGHT : GREEN}
                strokeWidth="4"
                strokeDasharray={`${progress * 628.3} 628.3`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s linear" }}
              />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 700, fontFamily: MONO, color: C.text }}>{formatTime(displayTime)}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: GREEN_DIM, marginTop: 4 }}>{tier.type}</div>
            </div>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, fontStyle: "italic", maxWidth: 280, margin: "0 auto", lineHeight: 1.6 }}>{getMessage()}</div>

          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, letterSpacing: 1 }}>{minutesLeft} {minutesLeft === 1 ? "minute" : "minutes"} remaining</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: GREEN_DIM, letterSpacing: 2, marginTop: 6 }}>{tier.code} {"\u2022"} {tier.name.toUpperCase()}</div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // EFFORT RATING
  // ═══════════════════════════════════════
  if (step === "effort") {
    const ratings = [
      { label: "Easy", color: GREEN_LIGHT },
      { label: "Moderate", color: "#f59e0b" },
      { label: "Hard", color: "#ef4444" },
      { label: "All Out", color: "#a855f7" },
    ];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <RidgeBg opacity={0.5} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_DIM, letterSpacing: 2, marginBottom: 16 }}>DEBRIEF</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>How Was That?</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, marginBottom: 24 }}>Rate your effort honestly.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
            {ratings.map((r, i) => (
              <div key={i} onClick={() => setEffortRating(r.label)} style={{
                padding: "14px 8px", cursor: "pointer", flex: 1,
                background: effortRating === r.label ? `${r.color}15` : "transparent",
                border: `1px solid ${effortRating === r.label ? r.color + '66' : C.border}`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: effortRating === r.label ? r.color : C.textDim }}>{r.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep("done")} disabled={!effortRating} style={{
            width: "100%", padding: "16px", border: `1px solid ${effortRating ? GREEN + '55' : C.border}`,
            cursor: effortRating ? "pointer" : "default", background: effortRating ? GREEN_FAINT : "transparent",
            fontFamily: MONO, color: effortRating ? GREEN_LIGHT : C.textDim, fontSize: 14, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0, opacity: effortRating ? 1 : 0.4,
          }}>[ CONTINUE ]</button>
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
        <RidgeBg opacity={0.55} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_DIM, letterSpacing: 2, marginBottom: 16 }}>RECON COMPLETE</div>

          <div style={{ fontFamily: MONO, fontSize: 48, color: C.green, fontWeight: 700, marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Territorial Awareness: Confirmed</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: GREEN_LIGHT, marginBottom: 4 }}>{tier.code} {"\u2022"} {tier.name}{effortRating ? ` \u2014 ${effortRating.toLowerCase()}` : ""}</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 20 }}>Estimated distance: {tier.distMiles}</div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: GREEN_LIGHT }}>{tier.xp}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>XP</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.green }}>{tier.gold}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>GOLD</div>
            </div>
          </div>

          <div style={{ padding: "14px 16px", border: `1px solid ${GREEN_DIM}22`, background: GREEN_FAINT, marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>"{quote.text}"</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN_DIM, marginTop: 6 }}>{"\u2014"} {quote.author}</div>
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