import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const TIERS = [
  { name: "Signal Fire", emoji: "\u{1F54A}\uFE0F", xp: 10, gold: 2, reqCha: 0, minAway: 60,
    desc: "Text or DM a friend or family member.",
    mission: "Send a real message to someone you care about. Not a meme. Not a forward. Something personal \u2014 even if it's just \"Hey, thinking about you.\"",
    action: "Open your messages and send it.",
  },
  { name: "The Call", emoji: "\u{1F4EF}", xp: 15, gold: 3, reqCha: 15, minAway: 180,
    desc: "Call a friend or family member. Actually talk.",
    mission: "Pick up the phone and call someone. Not a voice note \u2014 a real call. Ask how they're doing. Listen. Three minutes minimum.",
    action: "Open your phone and make the call.",
  },
  { name: "Seek the Wise", emoji: "\u{1F989}", xp: 20, gold: 4, reqCha: 20, minAway: 180,
    desc: "Reach out to a mentor or someone you want to learn from.",
    mission: "Message someone you respect \u2014 a mentor, a professional you admire, someone further down the path you want to walk. Ask a genuine question. Introduce yourself if you haven't met.",
    action: "Find them and reach out.",
  },
  { name: "War Council", emoji: "\u2694\uFE0F", xp: 25, gold: 5, reqCha: 25, minAway: 120,
    desc: "Coordinate and schedule an activity with someone this week.",
    mission: "Don't just reach out \u2014 lock something in. A coffee, a workout, a study session, a meal. Pick a person, pick a day, pick a time. Confirm it before you come back.",
    action: "Message them and confirm a day and time.",
  },
];

export default function RallyAlliesFlow({ onBack, playerStats = {} }) {
  const [step, setStep] = useState("prep");
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);

  // Visibility tracking
  const [awayStarted, setAwayStarted] = useState(false);
  const [totalAwayTime, setTotalAwayTime] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);
  const leftAtRef = useRef(null);
  const awayAccumulatedRef = useRef(0);

  const info = RITUAL_INSTRUCTIONS["Reach Out"];
  const quote = getRandomQuote("Reach Out");
  const tier = TIERS[selectedTier];
  const chaLevel = playerStats.cha || 10;

  // Page Visibility API — track time away
  useEffect(() => {
    if (step !== "away") return;
    const handleVisibility = () => {
      if (document.hidden) {
        // User left the app
        leftAtRef.current = Date.now();
      } else {
        // User came back
        if (leftAtRef.current) {
          const awayMs = Date.now() - leftAtRef.current;
          awayAccumulatedRef.current += awayMs;
          const totalSec = Math.floor(awayAccumulatedRef.current / 1000);
          setTotalAwayTime(totalSec);
          if (totalSec >= tier.minAway) {
            setCanConfirm(true);
          }
          leftAtRef.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [step, tier.minAway]);

  const startMission = () => {
    setAwayStarted(true);
    setTotalAwayTime(0);
    setCanConfirm(false);
    awayAccumulatedRef.current = 0;
    leftAtRef.current = null;
    setStep("away");
  };

  const formatMinSec = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    if (min > 0) return `${min}m ${sec}s`;
    return `${sec}s`;
  };

  const BgLayer = ({ opacity = 0.2 }) => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/rally-bg.png)",
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
    { emoji: "\u{1F5E1}\uFE0F", title: "Rally Your Allies", body: "No one builds alone. The strongest warriors have the strongest bonds. This ritual is about reaching out \u2014 not waiting to be reached.", accent: null },
    { emoji: "\u{1F91D}", title: "Choose Your Challenge", body: "Four tiers. A text takes courage. A phone call takes more. Reaching out to a mentor takes real nerve. Scheduling something and following through? That's leadership.", accent: "Harder tiers unlock as your Charisma grows." },
    { emoji: "\u{1F4F1}", title: "How It Works", body: "Pick your tier. Read the mission. Leave the app and go do it. When you come back, confirm you completed it. The app tracks that you actually left \u2014 no shortcuts.", accent: "You must leave the app to complete this ritual." },
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
                    <img src="/Aristotle.png" alt="Aristotle" style={{ width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated", filter: "brightness(1.1)" }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Face the Resistance</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>"{info.featuredQuote.text}"</div>
                    <div style={{ fontSize: 11, color: C.gold }}>{"\u2014"} {info.featuredQuote.author}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>The voice saying "I'll text them later" is the same voice that said it yesterday and the day before. Later never comes. Right now does.</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>One message. One call. One person who will be glad to hear from you.</p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>Your allies are waiting. Rally them.</p>
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Who will you reach?</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Your CHA: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{chaLevel}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map((t, i) => {
              const locked = chaLevel < t.reqCha;
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
                        {locked && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>{"\u{1F512}"} CHA {t.reqCha}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{t.xp} XP {"\u00B7"} {t.gold} gold</div>
                    </div>
                    {selected && !locked && <span style={{ fontSize: 18, color: C.gold }}>{"\u2713"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setStep("mission")} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, background: "#22c55e", color: "#000", marginTop: 20 }}>Accept Mission</button>
        </div>
      </div>
    );
  }

  // ── MISSION CARD ──
  if (step === "mission") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer opacity={0.3} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{tier.emoji}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{tier.name}</div>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Your Mission</div>

          <div style={{ padding: "20px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "left", marginBottom: 16 }}>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>{tier.mission}</p>
          </div>

          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>{tier.action}</p>
          </div>

          <button onClick={startMission} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, background: "#22c55e", color: "#000" }}>Go Do It</button>
          <button onClick={() => setStep("tierSelect")} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: "transparent", color: C.textMuted, marginTop: 8 }}>{"\u2190"} Change Tier</button>
        </div>
      </div>
    );
  }

  // ── AWAY / WAITING ──
  if (step === "away") {
    const remaining = Math.max(0, tier.minAway - totalAwayTime);
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", position: "relative" }}>
        <BgLayer opacity={0.35} />
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, height: "100vh",
          background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none", zIndex: 1,
        }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", width: "100%", maxWidth: 320 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{tier.emoji}</div>

          {canConfirm ? (
            <>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>Welcome back.</div>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
                You were away for {formatMinSec(totalAwayTime)}. Did you complete the mission?
              </p>
              <div style={{ padding: "16px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}`, marginBottom: 24, textAlign: "left" }}>
                <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{tier.name}</div>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{tier.mission}</p>
              </div>
              <button onClick={() => setStep("done")} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, background: "#22c55e", color: "#000", marginBottom: 10 }}>Yes, I Did It</button>
              <button onClick={() => {
                // Reset and let them try again
                awayAccumulatedRef.current = 0;
                leftAtRef.current = null;
                setTotalAwayTime(0);
                setCanConfirm(false);
              }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 14, fontWeight: 600, background: "transparent", color: C.textMuted }}>Not yet {"\u2014"} I need more time</button>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 8 }}>
                {totalAwayTime > 0 ? "Looks like you came back quickly." : "We'll be here when you get back."}
              </div>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 8 }}>
                {totalAwayTime > 0
                  ? "Take your time \u2014 go finish the mission."
                  : "Leave the app now. Go complete your mission."
                }
              </p>
              {totalAwayTime > 0 && (
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>
                  Away: {formatMinSec(totalAwayTime)} / {formatMinSec(tier.minAway)} needed
                </div>
              )}
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "#f59e0b", lineHeight: 1.5 }}>{tier.action}</p>
              </div>
              <div style={{ fontSize: 11, color: C.textDim, fontStyle: "italic" }}>The app is tracking that you leave to complete this.</div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (step === "done") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease" }}>
        <BgLayer opacity={0.25} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{tier.emoji}</div>
          <div style={{ fontSize: 48, color: C.ritualDone, fontWeight: 800, fontFamily: "'Cinzel', serif", marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 20, color: C.ritualDone, fontWeight: 700, marginBottom: 4 }}>Ritual Complete!</div>
          <div style={{ fontSize: 14, color: C.gold, fontWeight: 600, marginBottom: 8 }}>{tier.name} {"\u2014"} bond strengthened</div>
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