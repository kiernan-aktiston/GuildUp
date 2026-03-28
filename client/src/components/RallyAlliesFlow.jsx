import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const GOLD = "#c9a84c";
const GOLD_DIM = "#7a6a3a";
const GOLD_FAINT = "rgba(201, 168, 76, 0.08)";
const MONO = "'Courier New', 'Consolas', monospace";

const TIERS = [
  { name: "Signal Fire", code: "SF-01", xp: 10, gold: 2, reqCha: 0, minAway: 60,
    desc: "Text or DM a friend or family member.", method: "Text / DM" },
  { name: "The Call", code: "TC-02", xp: 15, gold: 3, reqCha: 15, minAway: 180,
    desc: "Call someone. Actually talk.", method: "Phone Call" },
  { name: "Seek the Wise", code: "SW-03", xp: 20, gold: 4, reqCha: 20, minAway: 180,
    desc: "Reach out to a mentor or someone you want to learn from.", method: "Any Method" },
  { name: "War Council", code: "WC-04", xp: 25, gold: 5, reqCha: 25, minAway: 120,
    desc: "Coordinate and schedule an activity with someone this week.", method: "Any Method" },
];

const CATEGORIES = [
  { key: "family", label: "Family", desc: "Blood runs deep" },
  { key: "friends", label: "Friends", desc: "Your inner circle" },
  { key: "network", label: "Network", desc: "Professional connections & mentors" },
  { key: "romance", label: "Romance", desc: "Someone important" },
];

const INTENTS = [
  { key: "check_in", label: "Check in on them" },
  { key: "advice", label: "Ask for advice" },
  { key: "reconnect", label: "Reconnect after a while" },
  { key: "encourage", label: "Encourage or support them" },
  { key: "plans", label: "Set up plans to meet" },
  { key: "thank", label: "Thank them for something" },
  { key: "share", label: "Share something meaningful" },
];

const LUCIEN_QUOTES = [
  "Your network is the only asset that appreciates when you give it away. Reach out. Now.",
  "Silence is how you disappear. In this world, the invisible don't get contracts. They get forgotten.",
  "One message. That's all it takes to remind someone you exist. Existence is leverage.",
  "Every relationship you neglect is a bridge rotting in the rain. When you need to cross it, it won't hold.",
  "I've watched guilds collapse not from combat losses, but from members who stopped talking to each other.",
  "The person you reach out to today may be the person who saves your life next year. That's not sentiment. That's probability.",
  "Charm is a tool. Consistency is the real weapon. Be the person who always shows up.",
];

function ChamberBg({ opacity = 1 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "url(/signal-chamber.png)", backgroundSize: "cover", backgroundPosition: "center",
      opacity,
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%)" }} />
    </div>
  );
}

function getDaySeed(userId = "") {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear + userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

export default function RallyAlliesFlow({ onBack, playerStats = {}, userId = "" }) {
  const [step, setStep] = useState("intro1");
  const [selectedTier, setSelectedTier] = useState(0);
  const [category, setCategory] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [intent, setIntent] = useState(null);
  const [showResistance, setShowResistance] = useState(false);
  const [totalAwayTime, setTotalAwayTime] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);
  const leftAtRef = useRef(null);
  const awayAccumulatedRef = useRef(0);

  const quote = getRandomQuote("Reach Out");
  const lucienQuote = LUCIEN_QUOTES[getDaySeed(userId) % LUCIEN_QUOTES.length];
  const tier = TIERS[selectedTier];
  const chaLevel = playerStats.cha || 10;

  useEffect(() => {
    if (step !== "away") return;
    const handleVisibility = () => {
      if (document.hidden) {
        leftAtRef.current = Date.now();
      } else {
        if (leftAtRef.current) {
          const awayMs = Date.now() - leftAtRef.current;
          awayAccumulatedRef.current += awayMs;
          const totalSec = Math.floor(awayAccumulatedRef.current / 1000);
          setTotalAwayTime(totalSec);
          if (totalSec >= tier.minAway) setCanConfirm(true);
          leftAtRef.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [step, tier.minAway]);

  const startMission = () => {
    setTotalAwayTime(0); setCanConfirm(false);
    awayAccumulatedRef.current = 0; leftAtRef.current = null;
    setStep("away");
  };

  const formatMinSec = (s) => {
    const min = Math.floor(s / 60); const sec = s % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  const getMissionText = () => {
    const int = INTENTS.find(i => i.key === intent);
    if (selectedTier === 0) return `Send a text or DM to ${recipientName || "them"}. ${int?.label || "Reach out"}.`;
    if (selectedTier === 1) return `Call ${recipientName || "them"} on the phone. ${int?.label || "Reach out"}. Talk for at least 3 minutes.`;
    if (selectedTier === 2) return `Reach out to ${recipientName || "someone you want to learn from"}. ${int?.label || "Ask a genuine question"}.`;
    if (selectedTier === 3) return `Message ${recipientName || "them"} and lock in plans. Pick a day, pick a time, confirm it.`;
    return `Reach out to ${recipientName || "someone"}.`;
  };

  // ═══════════════════════════════════════
  // SLIDE 1: THE COMPACT'S MANDATE
  // ═══════════════════════════════════════
  if (step === "intro1") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <ChamberBg opacity={0.35} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD_DIM, letterSpacing: 3, marginBottom: 32, textTransform: "uppercase" }}>The Compact {"\u2014"} Contractor Protocol</div>

          <div style={{ fontSize: 13, color: C.text, lineHeight: 2, fontFamily: "'Inter', sans-serif", marginBottom: 48 }}>
            Contractors are required to maintain active communication within their network. An isolated operator is a compromised operator.
            <span style={{ display: "block", height: 16 }} />
            Your guild's reach depends on every member's connections. Neglected relationships are structural vulnerabilities.
            <span style={{ display: "block", height: 16 }} />
            <span style={{ color: GOLD }}>One contact. One message. That is the minimum.</span>
          </div>

          <button onClick={() => setStep("intro2")} style={{
            padding: "14px 48px", border: `1px solid ${GOLD}44`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: GOLD, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ACKNOWLEDGED ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SLIDE 2: LUCIEN INTRODUCTION
  // ═══════════════════════════════════════
  if (step === "intro2") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <ChamberBg opacity={0.25} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ marginBottom: 20 }}>
            <img src="/lucien-portrait.png" alt="Lucien" style={{
              width: 160, height: 160, objectFit: "cover", borderRadius: "50%",
              border: `2px solid ${GOLD}33`,
            }} onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>Signal Protocol Director</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: 2, marginBottom: 20 }}>Lucien</div>

          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 2, fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 40, padding: "0 8px" }}>
            "{lucienQuote}"
          </div>

          <button onClick={() => setStep("tierSelect")} style={{
            padding: "14px 48px", border: `1px solid ${GOLD}44`, cursor: "pointer",
            background: GOLD_FAINT, fontFamily: MONO, color: GOLD, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ENTER THE CHAMBER ]</button>
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
        <ChamberBg opacity={0.12} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => onBack(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: MONO }}>{"\u2190"} abort</button>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 2, marginBottom: 8 }}>SIGNAL PROTOCOL</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2 }}>Choose Your Approach</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD_DIM, marginTop: 6 }}>CHA: {chaLevel}</div>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 1, marginBottom: 12 }}>PROTOCOL TIER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {TIERS.map((t, i) => {
              const locked = chaLevel < t.reqCha;
              const selected = selectedTier === i;
              return (
                <div key={i} onClick={() => { if (!locked) setSelectedTier(i); }} style={{
                  padding: "14px 16px", cursor: locked ? "default" : "pointer",
                  background: selected && !locked ? GOLD_FAINT : "transparent",
                  border: `1px solid ${selected && !locked ? GOLD + '44' : C.border}`,
                  opacity: locked ? 0.3 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM }}>{t.code}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: selected ? GOLD : C.text }}>{t.name}</span>
                        {locked && <span style={{ fontFamily: MONO, fontSize: 9, color: "#ef4444" }}>LOCKED {"\u2014"} CHA {t.reqCha}</span>}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 4 }}>{t.method} {"\u00B7"} {t.xp}xp {"\u00B7"} {t.gold}g</div>
                    </div>
                    {selected && !locked && <span style={{ fontFamily: MONO, fontSize: 14, color: GOLD }}>{"\u25C9"}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => { setCategory(null); setStep("category"); }} style={{
            width: "100%", padding: "16px", border: `1px solid ${GOLD}55`, cursor: "pointer",
            background: GOLD_FAINT, fontFamily: MONO, color: GOLD, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ NEXT {"\u2014"} {tier.name.toUpperCase()} ]</button>

          <button onClick={() => setShowResistance(true)} style={{
            width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, marginTop: 8, borderRadius: 0,
          }}>[ NOT TODAY ]</button>

          {showResistance && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${GOLD_DIM}44` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 1, marginBottom: 16 }}>LUCIEN:</div>
                <div style={{ fontSize: 13, color: GOLD, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  The voice saying "I'll text them later" is the same voice that said it yesterday. Later never comes. Right now does.
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  One message. One person who will be glad to hear from you. That's all.
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 20 }}>
                  Your allies are waiting. Don't leave them waiting.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { setShowResistance(false); setCategory(null); setStep("category"); }} style={{ width: "100%", padding: "14px", border: `1px solid ${GOLD}55`, cursor: "pointer", background: GOLD_FAINT, fontFamily: MONO, color: GOLD, fontSize: 13, fontWeight: 600, borderRadius: 0 }}>[ PROCEED ]</button>
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
  // CATEGORY
  // ═══════════════════════════════════════
  if (step === "category") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ChamberBg opacity={0.1} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("tierSelect")} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, fontFamily: MONO }}>{"\u2190"} back</button>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 2, marginBottom: 8 }}>{tier.code} {"\u2022"} {tier.name}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20 }}>Who are you reaching out to?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATEGORIES.map(cat => {
              const selected = category === cat.key;
              return (
                <div key={cat.key} onClick={() => setCategory(cat.key)} style={{
                  padding: "14px 16px", cursor: "pointer",
                  background: selected ? GOLD_FAINT : "transparent",
                  border: `1px solid ${selected ? GOLD + '44' : C.border}`,
                }}>
                  <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: selected ? GOLD : C.text }}>{cat.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginTop: 2 }}>{cat.desc}</div>
                </div>
              );
            })}
          </div>
          <button onClick={() => { if (category) { setRecipientName(""); setStep("recipient"); } }} disabled={!category} style={{
            width: "100%", padding: "16px", border: `1px solid ${category ? GOLD + '55' : C.border}`, cursor: category ? "pointer" : "default",
            background: category ? GOLD_FAINT : "transparent", fontFamily: MONO, color: category ? GOLD : C.textDim,
            fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0, marginTop: 20, opacity: category ? 1 : 0.4,
          }}>[ NEXT ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RECIPIENT
  // ═══════════════════════════════════════
  if (step === "recipient") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ChamberBg opacity={0.1} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("category")} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, fontFamily: MONO }}>{"\u2190"} back</button>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 2, marginBottom: 8 }}>{tier.code} {"\u2022"} {CATEGORIES.find(c => c.key === category)?.label}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>Who specifically?</div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>Type their name. Making it specific makes it real.</div>
          <input
            type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)}
            placeholder="First name" autoFocus
            style={{
              width: "100%", padding: "14px 16px", fontSize: 15, fontFamily: MONO,
              background: "transparent", border: `1px solid ${C.border}`,
              color: C.text, outline: "none", marginBottom: 20, borderRadius: 0,
            }}
            onFocus={e => e.target.style.borderColor = GOLD + '55'}
            onBlur={e => e.target.style.borderColor = C.border}
            onKeyDown={e => { if (e.key === "Enter" && recipientName.trim()) { setIntent(null); setStep("intent"); } }}
          />
          <button onClick={() => { if (recipientName.trim()) { setIntent(null); setStep("intent"); } }} disabled={!recipientName.trim()} style={{
            width: "100%", padding: "16px", border: `1px solid ${recipientName.trim() ? GOLD + '55' : C.border}`,
            cursor: recipientName.trim() ? "pointer" : "default",
            background: recipientName.trim() ? GOLD_FAINT : "transparent", fontFamily: MONO,
            color: recipientName.trim() ? GOLD : C.textDim, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
            opacity: recipientName.trim() ? 1 : 0.4,
          }}>[ NEXT ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // INTENT
  // ═══════════════════════════════════════
  if (step === "intent") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ChamberBg opacity={0.1} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("recipient")} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, fontFamily: MONO }}>{"\u2190"} back</button>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 2, marginBottom: 8 }}>{tier.code} {"\u2022"} {recipientName}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>Why are you reaching out?</div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>Pick your intent. This shapes your mission.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INTENTS.map(int => {
              const selected = intent === int.key;
              return (
                <div key={int.key} onClick={() => setIntent(int.key)} style={{
                  padding: "12px 16px", cursor: "pointer",
                  background: selected ? GOLD_FAINT : "transparent",
                  border: `1px solid ${selected ? GOLD + '44' : C.border}`,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: selected ? GOLD : C.text }}>{int.label}</span>
                </div>
              );
            })}
          </div>
          <button onClick={() => { if (intent) setStep("mission"); }} disabled={!intent} style={{
            width: "100%", padding: "16px", border: `1px solid ${intent ? GOLD + '55' : C.border}`,
            cursor: intent ? "pointer" : "default",
            background: intent ? GOLD_FAINT : "transparent", fontFamily: MONO,
            color: intent ? GOLD : C.textDim, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
            marginTop: 20, opacity: intent ? 1 : 0.4,
          }}>[ SEE YOUR MISSION ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // MISSION CARD
  // ═══════════════════════════════════════
  if (step === "mission") {
    const cat = CATEGORIES.find(c => c.key === category);
    const int = INTENTS.find(i => i.key === intent);
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ChamberBg opacity={0.2} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 340 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 2, marginBottom: 12 }}>YOUR MISSION</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: GOLD, marginBottom: 20 }}>{tier.name}</div>

          <div style={{ padding: "18px", background: GOLD_FAINT, border: `1px solid ${GOLD}22`, marginBottom: 20, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM }}>WHO</span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.text }}>{recipientName} ({cat?.label})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM }}>HOW</span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.text }}>{tier.method}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM }}>WHY</span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.text }}>{int?.label}</span>
            </div>
            <div style={{ height: 1, background: `${GOLD}22`, marginBottom: 12 }} />
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>{getMissionText()}</div>
          </div>

          <button onClick={startMission} style={{
            width: "100%", padding: "16px", border: `1px solid ${GOLD}55`, cursor: "pointer",
            background: GOLD_FAINT, fontFamily: MONO, color: GOLD, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ GO DO IT ]</button>
          <button onClick={() => setStep("intent")} style={{
            width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, marginTop: 8, borderRadius: 0,
          }}>{"\u2190"} change mission</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // AWAY
  // ═══════════════════════════════════════
  if (step === "away") {
    const int = INTENTS.find(i => i.key === intent);
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", position: "relative" }}>
        <ChamberBg opacity={0.15} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>
          {canConfirm ? (
            <>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.green, marginBottom: 8 }}>Welcome back.</div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>You were away for {formatMinSec(totalAwayTime)}.</div>
              <div style={{ padding: "14px 16px", background: GOLD_FAINT, border: `1px solid ${GOLD}22`, marginBottom: 20 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: GOLD, fontWeight: 600, marginBottom: 4 }}>{tier.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: C.text }}>{recipientName} {"\u00B7"} {int?.label}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>Did you do it?</div>
              <button onClick={() => setStep("done")} style={{
                width: "100%", padding: "16px", border: `1px solid ${C.green}55`, cursor: "pointer",
                background: "rgba(74,124,80,0.1)", fontFamily: MONO, color: C.green, fontSize: 14, fontWeight: 600, borderRadius: 0, marginBottom: 8,
              }}>[ YES, I DID IT ]</button>
              <button onClick={() => { awayAccumulatedRef.current = 0; leftAtRef.current = null; setTotalAwayTime(0); setCanConfirm(false); }} style={{
                width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
                background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, borderRadius: 0,
              }}>[ NOT YET {"\u2014"} I NEED MORE TIME ]</button>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: GOLD, marginBottom: 8 }}>
                {totalAwayTime > 0 ? "Back already?" : "We'll be here when you return."}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                {totalAwayTime > 0 ? "Take your time. Go finish the mission." : `Leave the app now. Reach out to ${recipientName}.`}
              </div>
              {totalAwayTime > 0 && (
                <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD_DIM, marginBottom: 12 }}>Away: {formatMinSec(totalAwayTime)} / {formatMinSec(tier.minAway)} needed</div>
              )}
              <div style={{ padding: "12px 16px", background: GOLD_FAINT, border: `1px solid ${GOLD}22`, marginBottom: 20 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, marginBottom: 4 }}>{tier.method} {"\u00B7"} {int?.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 14, color: C.text, fontWeight: 600 }}>{recipientName}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim }}>The app tracks that you leave to complete this.</div>
            </>
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
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", position: "relative", animation: "fadeIn 0.3s ease" }}>
        <ChamberBg opacity={0.2} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, letterSpacing: 2, marginBottom: 16 }}>SIGNAL COMPLETE</div>

          <div style={{ fontFamily: MONO, fontSize: 48, color: C.green, fontWeight: 700, marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Connection Made</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: GOLD, marginBottom: 4 }}>{tier.code} {"\u2022"} {tier.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, marginBottom: 20 }}>You reached out to {recipientName}.</div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: GOLD }}>{tier.xp}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>XP</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.green }}>{tier.gold}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>GOLD</div>
            </div>
          </div>

          <div style={{ padding: "14px 16px", border: `1px solid ${GOLD_DIM}22`, background: GOLD_FAINT, marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>"{quote.text}"</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD_DIM, marginTop: 6 }}>{"\u2014"} {quote.author}</div>
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