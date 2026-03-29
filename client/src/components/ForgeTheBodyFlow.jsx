import { useState, useEffect, useRef } from "react";
import { C, getRandomQuote } from "../constants";

const AMBER = "#c47a20";
const AMBER_DIM = "#7a4d14";
const AMBER_FAINT = "rgba(196, 122, 32, 0.08)";
const MONO = "'Courier New', 'Consolas', monospace";
const TEXTBOX = { background: "rgba(0,0,0,0.7)", padding: "20px 22px", border: "1px solid rgba(196,122,32,0.25)" };

const TIERS = [
  {
    name: "Warm Blood", code: "WB-01", xp: 10, gold: 2, reqStr: 0,
    desc: "Stretch and move. Build the foundation.",
    exercises: [
      { name: "Neck Rolls", duration: 20, instruction: "Slow circles, both directions. Release tension.", type: "stretch" },
      { name: "Shoulder Stretch", duration: 20, instruction: "Pull each arm across your chest. Hold and breathe.", type: "stretch" },
      { name: "Quad Stretch", duration: 20, instruction: "Standing, pull each foot to your glute. Balance.", type: "stretch" },
      { name: "Hamstring Touch", duration: 20, instruction: "Feet together, bend and reach for toes. Don't bounce.", type: "stretch" },
      { name: "Hip Circles", duration: 20, instruction: "Hands on hips, wide circles. Loosen up.", type: "stretch" },
      { name: "Standing Twists", duration: 30, instruction: "Feet planted, twist torso side to side. Rotate through the spine.", type: "stretch" },
      { name: "Push-ups", duration: 30, instruction: "Wall or floor. Full range of motion. Scale as needed.", type: "work" },
      { name: "Bodyweight Squats", duration: 30, instruction: "Feet shoulder-width, break parallel, drive up.", type: "work" },
      { name: "Crunches", duration: 30, instruction: "Hands behind head, curl up, squeeze at the top.", type: "work" },
      { name: "Lunges", duration: 30, instruction: "Alternate legs. Back knee to the ground.", type: "work" },
      { name: "Plank", duration: 30, instruction: "Forearms down, body straight. Hold steady.", type: "work" },
      { name: "Jumping Jacks", duration: 30, instruction: "Full extension, light on your feet. Finish strong.", type: "work" },
    ],
  },
  {
    name: "Iron Will", code: "IW-02", xp: 15, gold: 3, reqStr: 15,
    desc: "Push harder. Build real strength.",
    exercises: [
      { name: "Arm Circles", duration: 20, instruction: "Small to large circles. Both directions.", type: "stretch" },
      { name: "Leg Swings", duration: 20, instruction: "Forward and lateral. Hold something for balance.", type: "stretch" },
      { name: "Cat-Cow Stretch", duration: 20, instruction: "On all fours. Arch and round the spine.", type: "stretch" },
      { name: "Push-ups", duration: 45, instruction: "Full push-ups. Chest to the ground. No shortcuts.", type: "work" },
      { name: "Jump Squats", duration: 35, instruction: "Squat deep, explode up. Land soft.", type: "work" },
      { name: "Mountain Climbers", duration: 35, instruction: "Plank position. Drive knees fast.", type: "work" },
      { name: "Burpees", duration: 35, instruction: "Down, out, up, jump. Every rep counts.", type: "work" },
      { name: "Rest", duration: 30, instruction: "Breathe. You're not done.", type: "rest" },
      { name: "Diamond Push-ups", duration: 35, instruction: "Hands together. Triceps and chest.", type: "work" },
      { name: "Pistol Squats", duration: 35, instruction: "Single leg. Use a wall for support if needed.", type: "work" },
      { name: "Plank", duration: 60, instruction: "One minute. No dropping. Mind over body.", type: "work" },
      { name: "Burpees", duration: 45, instruction: "Last set. Leave nothing.", type: "burnout" },
    ],
  },
  {
    name: "Forged Steel", code: "FS-03", xp: 20, gold: 4, reqStr: 20,
    desc: "Beyond comfort. Prove what you're made of.",
    exercises: [
      { name: "Dynamic Stretch", duration: 30, instruction: "Full body flow. Get warm fast.", type: "stretch" },
      { name: "Explosive Push-ups", duration: 40, instruction: "Push hard enough to lift your hands. Power.", type: "work" },
      { name: "Tuck Jumps", duration: 35, instruction: "Jump and bring knees to chest.", type: "work" },
      { name: "Pike Push-ups", duration: 40, instruction: "Hips high. Shoulder press motion.", type: "work" },
      { name: "Split Squats", duration: 40, instruction: "Rear foot elevated if possible.", type: "work" },
      { name: "Rest", duration: 20, instruction: "Quick. The forge doesn't cool down for you.", type: "rest" },
      { name: "Handstand Hold", duration: 30, instruction: "Wall-assisted. Build shoulder stability.", type: "work" },
      { name: "Squat Hold", duration: 45, instruction: "Bottom position. Don't come up until time.", type: "work" },
      { name: "Push-up Burnout", duration: 60, instruction: "As many as possible. Form first, then grit.", type: "burnout" },
      { name: "Plank", duration: 90, instruction: "Ninety seconds. This is where you're made.", type: "work" },
      { name: "Burpee Burnout", duration: 60, instruction: "Everything you have left. Empty the tank.", type: "burnout" },
    ],
  },
  {
    name: "Obsidian", code: "OB-04", xp: 25, gold: 5, reqStr: 25,
    desc: "The hardest protocol. Not everyone finishes.",
    exercises: [
      { name: "Active Warm-up", duration: 30, instruction: "High knees, butt kicks, arm swings. Move fast.", type: "stretch" },
      { name: "Muscle-up Prep", duration: 45, instruction: "Explosive pull-up motion. Build the pathway.", type: "work" },
      { name: "Pistol Squats", duration: 50, instruction: "Full depth. Both legs. No assistance.", type: "work" },
      { name: "Planche Lean", duration: 40, instruction: "Hands by hips, lean forward. Hold tension.", type: "work" },
      { name: "L-Sit Hold", duration: 30, instruction: "Legs straight, hold off the ground.", type: "work" },
      { name: "Rest", duration: 15, instruction: "Fifteen seconds. That's all you get.", type: "rest" },
      { name: "One-Arm Push-ups", duration: 50, instruction: "Per arm. Scale to incline if needed.", type: "work" },
      { name: "Explosive Squats", duration: 50, instruction: "Max height. Max speed. Max effort.", type: "work" },
      { name: "Handstand Push-ups", duration: 45, instruction: "Wall-assisted. Full range.", type: "work" },
      { name: "Plank", duration: 120, instruction: "Two minutes. Your mind will quit before your body. Don't let it.", type: "work" },
      { name: "Full Burnout", duration: 90, instruction: "Burpees until time. This is the test. Pass it.", type: "burnout" },
    ],
  },
];

const MARCUS_QUOTES = [
  "You're not here because you want to be. You're here because the alternative is weakness. And in this world, weakness is a death sentence.",
  "Suffering voluntarily is the only suffering that makes you stronger. Everything else is just damage.",
  "I don't care how you feel. I care if you showed up. Feelings pass. What you built today stays.",
  "The body is the first instrument. If it fails, nothing else matters. Not your mind, not your spirit, not your allies.",
  "Marcus Aurelius trained in the cold before dawn. Not because it was pleasant. Because pleasant men don't survive empires.",
  "You will want to quit. That impulse is useful information — it tells you exactly where your limit is. Now go past it.",
  "Discipline is not a personality trait. It is a decision you make every single morning. Make it now.",
];

// ─── Canyon background component ───
function CanyonBg({ opacity = 1 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "url(/forge-canyon.png)", backgroundSize: "cover", backgroundPosition: "center",
      opacity,
    }} />
  );
}

function getDaySeed(userId = "") {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear + userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

export default function ForgeTheBodyFlow({ onBack, playerStats = {}, userId = "" }) {
  const [step, setStep] = useState("intro1");
  const [showResistance, setShowResistance] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [pauseOffset, setPauseOffset] = useState(0);
  const [exerciseFinished, setExerciseFinished] = useState(false);
  const tickRef = useRef(null);
  const pauseRef = useRef(null);

  const quote = getRandomQuote("Bodyweight Workout");
  const marcusQuote = MARCUS_QUOTES[getDaySeed(userId) % MARCUS_QUOTES.length];
  const tier = TIERS[selectedTier];
  const currentExercise = tier?.exercises[exerciseIdx];
  const isLastExercise = tier ? exerciseIdx === tier.exercises.length - 1 : false;
  const strLevel = playerStats.str || 10;

  useEffect(() => {
    if (step !== "active" || !exerciseStartTime || paused) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - exerciseStartTime - pauseOffset) / 1000);
      const remaining = Math.max(0, currentExercise.duration - elapsed);
      setDisplayTime(remaining);
      if (remaining <= 0) { setExerciseFinished(true); clearInterval(tickRef.current); }
    };
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [step, exerciseStartTime, paused, exerciseIdx]);

  const startExercise = () => { setExerciseStartTime(Date.now()); setPauseOffset(0); setPaused(false); setExerciseFinished(false); setDisplayTime(currentExercise.duration); };
  const togglePause = () => {
    if (paused) { setPauseOffset(prev => prev + (Date.now() - (pauseRef.current || Date.now()))); setPaused(false); }
    else { pauseRef.current = Date.now(); setPaused(true); clearInterval(tickRef.current); }
  };
  const nextExercise = () => { if (isLastExercise) setStep("done"); else { setExerciseIdx(exerciseIdx + 1); setStep("transition"); } };
  const formatTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}`; };

  const totalDuration = tier ? tier.exercises.reduce((s, e) => s + e.duration, 0) : 0;
  const completedDuration = tier ? tier.exercises.slice(0, exerciseIdx).reduce((s, e) => s + e.duration, 0) : 0;
  const overallProgress = ((completedDuration + (currentExercise ? currentExercise.duration - displayTime : 0)) / totalDuration) * 100;

  // ═══════════════════════════════════════
  // SLIDE 1: THE COMPACT'S MANDATE
  // ═══════════════════════════════════════
  if (step === "intro1") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <CanyonBg opacity={0.7} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: 3, marginBottom: 32, fontWeight: 700, textTransform: "uppercase" }}>The Compact {"\u2014"} Contractor Protocol</div>

          <div style={{ ...TEXTBOX, fontSize: 14, color: "#fff", lineHeight: 2, fontFamily: "'Inter', sans-serif", fontWeight: 500, marginBottom: 36 }}>
            The Compact requires that all contractors maintain physical readiness sufficient to meet operational demands.
            <span style={{ display: "block", height: 16 }} />
            Failure to maintain baseline conditioning may result in contract reassignment.
            <span style={{ display: "block", height: 16 }} />
            <span style={{ color: AMBER, fontWeight: 700 }}>This protocol is not optional.</span>
          </div>

          <button onClick={() => setStep("intro2")} style={{
            padding: "14px 48px", border: `1px solid ${AMBER}44`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: AMBER, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ACKNOWLEDGED ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SLIDE 2: MARCUS INTRODUCTION
  // ═══════════════════════════════════════
  if (step === "intro2") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <CanyonBg opacity={0.6} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>

          {/* Portrait */}
          <div style={{ marginBottom: 20 }}>
            <img src="/marcus-portrait.png" alt="Marcus" style={{
              width: 160, height: 160, objectFit: "cover", borderRadius: "50%",
              border: `2px solid ${AMBER}33`,
            }} onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>Forge Protocol Director</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: 2, marginBottom: 20 }}>Marcus</div>

          <div style={{ ...TEXTBOX, fontSize: 14, color: "#ddd", lineHeight: 2, fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 40, border: `1px solid ${AMBER}33` }}>
            "{marcusQuote}"
          </div>

          <button onClick={() => setStep("briefing")} style={{
            padding: "14px 48px", border: `1px solid ${AMBER}44`, cursor: "pointer",
            background: AMBER_FAINT, fontFamily: MONO, color: AMBER, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ENTER THE FORGE ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // BRIEFING / TIER SELECT (the training floor)
  // ═══════════════════════════════════════
  if (step === "briefing") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <CanyonBg opacity={0.5} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => onBack(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: MONO }}>{"\u2190"} abort</button>

          {/* Protocol header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 8 }}>FORGE PROTOCOL</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2 }}>Select Your Trial</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: AMBER_DIM, marginTop: 6 }}>Physical Readiness {"\u2022"} Required Daily</div>
          </div>

          {/* Tier selection */}
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 1, marginBottom: 12 }}>PROTOCOL TIER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {TIERS.map((t, i) => {
              const locked = strLevel < t.reqStr;
              const selected = selectedTier === i;
              const mins = Math.ceil(t.exercises.reduce((s, e) => s + e.duration, 0) / 60);
              return (
                <div key={i} onClick={() => { if (!locked) setSelectedTier(i); }} style={{
                  padding: "14px 16px", cursor: locked ? "default" : "pointer",
                  background: selected && !locked ? AMBER_FAINT : "transparent",
                  border: `1px solid ${selected && !locked ? AMBER + '44' : C.border}`,
                  opacity: locked ? 0.3 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM }}>{t.code}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: selected ? AMBER : C.text }}>{t.name}</span>
                        {locked && <span style={{ fontFamily: MONO, fontSize: 9, color: "#ef4444" }}>LOCKED {"\u2014"} STR {t.reqStr}</span>}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 4 }}>{mins}min {"\u00B7"} {t.xp}xp {"\u00B7"} {t.gold}g</div>
                    </div>
                    {selected && !locked && <span style={{ fontFamily: MONO, fontSize: 14, color: AMBER }}>{"\u25C9"}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => { setExerciseIdx(0); setStep("transition"); }} style={{
            width: "100%", padding: "16px", border: `1px solid ${AMBER}55`, cursor: "pointer",
            background: AMBER_FAINT, fontFamily: MONO, color: AMBER, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ BEGIN {"\u2014"} {tier.name.toUpperCase()} ]</button>

          <button onClick={() => setShowResistance(true)} style={{
            width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, marginTop: 8, borderRadius: 0,
          }}>[ NOT TODAY ]</button>

          {/* Resistance modal */}
          {showResistance && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${AMBER_DIM}44` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 1, marginBottom: 16 }}>MARCUS:</div>
                <div style={{ fontSize: 13, color: AMBER, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  The voice telling you to skip today is the same one that told you to skip yesterday. It will say the same thing tomorrow.
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  {tier.name} is {Math.ceil(totalDuration / 60)} minutes. The Compact needs you operational. Five minutes of movement changes everything.
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: AMBER, fontWeight: 600, marginBottom: 20 }}>
                  The forge is hot. Step in.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { setShowResistance(false); setExerciseIdx(0); setStep("transition"); }} style={{ width: "100%", padding: "14px", border: `1px solid ${AMBER}55`, cursor: "pointer", background: AMBER_FAINT, fontFamily: MONO, color: AMBER, fontSize: 13, fontWeight: 600, borderRadius: 0 }}>[ BEGIN SESSION ]</button>
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
  // TRANSITION (exercise preview)
  // ═══════════════════════════════════════
  if (step === "transition" && currentExercise) {
    const isRest = currentExercise.type === "rest";
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", position: "relative" }}>
        <CanyonBg opacity={0.45} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 16 }}>{exerciseIdx + 1} / {tier.exercises.length}</div>
          <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: isRest ? C.textDim : C.text, marginBottom: 8 }}>{currentExercise.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 8 }}>{currentExercise.instruction}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: AMBER, fontWeight: 700, marginBottom: 24 }}>{formatTime(currentExercise.duration)}</div>

          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 28, flexWrap: "wrap", maxWidth: 280, margin: "0 auto 28px" }}>
            {tier.exercises.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, background: i < exerciseIdx ? AMBER : i === exerciseIdx ? C.text : C.surfaceLight, transition: "all 0.2s ease" }} />
            ))}
          </div>

          <button onClick={() => { setStep("active"); startExercise(); }} style={{
            padding: "16px 56px", border: `1px solid ${isRest ? C.border : AMBER + '55'}`, cursor: "pointer",
            background: isRest ? "transparent" : AMBER_FAINT,
            fontFamily: MONO, color: isRest ? C.textMuted : AMBER, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>{isRest ? "[ REST ]" : "[ START ]"}</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // ACTIVE (timer running)
  // ═══════════════════════════════════════
  if (step === "active" && currentExercise) {
    const isRest = currentExercise.type === "rest";
    const isBurnout = currentExercise.type === "burnout";
    const progress = currentExercise.duration > 0 ? ((currentExercise.duration - displayTime) / currentExercise.duration) * 100 : 0;
    const urgentColor = displayTime <= 5 && !isRest ? "#ef4444" : null;

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 24px 100px", position: "relative", background: "#050505",
      }}>
        <CanyonBg opacity={0.4} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 8 }}>{exerciseIdx + 1} / {tier.exercises.length}</div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: isBurnout ? "#ef4444" : isRest ? C.textDim : AMBER, marginBottom: 16, letterSpacing: 1 }}>{currentExercise.name}</div>

          <div style={{
            fontFamily: MONO, fontSize: 72, fontWeight: 700,
            color: urgentColor || C.text, marginBottom: 8, lineHeight: 1,
            transition: "color 0.3s ease",
          }}>{formatTime(displayTime)}</div>

          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>{currentExercise.instruction}</div>

          <div style={{ width: 280, height: 3, background: C.surfaceLight, overflow: "hidden", margin: "0 auto 16px" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: isBurnout ? "#ef4444" : isRest ? C.textDim : AMBER,
              transition: "width 0.5s linear",
            }} />
          </div>

          {!exerciseFinished && (
            <button onClick={togglePause} style={{
              padding: "10px 32px", border: `1px solid ${C.border}`, cursor: "pointer",
              background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, borderRadius: 0,
            }}>{paused ? "[ RESUME ]" : "[ PAUSE ]"}</button>
          )}
          {exerciseFinished && (
            <button onClick={nextExercise} style={{
              padding: "14px 48px", border: `1px solid ${AMBER}55`, cursor: "pointer",
              background: AMBER_FAINT, fontFamily: MONO, fontSize: 14, fontWeight: 600, borderRadius: 0,
              color: isLastExercise ? C.green : AMBER,
            }}>{isLastExercise ? "[ COMPLETE SESSION ]" : `[ NEXT: ${tier.exercises[exerciseIdx + 1]?.name} ]`}</button>
          )}

          <div style={{ marginTop: 28 }}>
            <div style={{ width: 280, height: 2, background: C.surfaceLight, overflow: "hidden", margin: "0 auto" }}>
              <div style={{ width: `${overallProgress}%`, height: "100%", background: AMBER, transition: "width 0.5s linear" }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, marginTop: 6, letterSpacing: 1 }}>{tier.code} {"\u2022"} {tier.name.toUpperCase()}</div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DONE (session complete)
  // ═══════════════════════════════════════
  if (step === "done") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", position: "relative" }}>
        <CanyonBg opacity={0.55} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 16 }}>SESSION COMPLETE</div>

          <div style={{ fontFamily: MONO, fontSize: 48, color: C.green, fontWeight: 700, marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>Physical Readiness: Confirmed</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: AMBER, marginBottom: 20 }}>{tier.code} {"\u2022"} {tier.name}</div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: AMBER }}>{tier.xp}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>XP</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.green }}>{tier.gold}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>GOLD</div>
            </div>
          </div>

          <div style={{ padding: "14px 16px", border: `1px solid ${AMBER_DIM}22`, background: AMBER_FAINT, marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>"{quote.text}"</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, marginTop: 6 }}>{"\u2014"} {quote.author}</div>
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