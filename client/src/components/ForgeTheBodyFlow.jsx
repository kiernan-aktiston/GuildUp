import { useState, useEffect, useRef } from "react";
import { C, getRandomQuote } from "../constants";

// ═══════════════════════════════════════
// THE FORGE — PHYSICAL READINESS PROTOCOL
// ═══════════════════════════════════════

const AMBER = "#c47a20";
const AMBER_DIM = "#7a4d14";
const AMBER_FAINT = "rgba(196, 122, 32, 0.08)";
const MONO = "'Courier New', 'Consolas', monospace";

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
    desc: "The real work begins. 8 exercises, built-in rest.",
    exercises: [
      { name: "Jumping Jacks", duration: 45, instruction: "Full extension \u2014 arms overhead, feet wide.", type: "work" },
      { name: "Rest", duration: 10, instruction: "Breathe. Shake it out.", type: "rest" },
      { name: "Push-ups", duration: 45, instruction: "Chest to floor, full lockout. Scale to knees if needed.", type: "work" },
      { name: "Rest", duration: 10, instruction: "Quick recovery. Stay standing.", type: "rest" },
      { name: "Bodyweight Squats", duration: 45, instruction: "Break parallel, drive through heels.", type: "work" },
      { name: "Rest", duration: 10, instruction: "Almost halfway.", type: "rest" },
      { name: "Plank", duration: 45, instruction: "Forearms down, body straight as a board.", type: "work" },
      { name: "Rest", duration: 10, instruction: "Breathe deep. Refocus.", type: "rest" },
      { name: "Lunges", duration: 45, instruction: "Alternate legs. Back knee kisses the ground.", type: "work" },
      { name: "Rest", duration: 10, instruction: "Past halfway.", type: "rest" },
      { name: "Mountain Climbers", duration: 45, instruction: "Hands planted, drive knees to chest. Fast.", type: "work" },
      { name: "Rest", duration: 10, instruction: "Two more. Dig in.", type: "rest" },
      { name: "Burpees", duration: 30, instruction: "Drop, chest to floor, push up, jump. No half reps.", type: "work" },
      { name: "Rest", duration: 10, instruction: "Last one. Give it everything.", type: "rest" },
      { name: "Superman Hold", duration: 30, instruction: "Face down, arms and legs lifted. Squeeze your back.", type: "work" },
    ],
  },
  {
    name: "Forged Steel", code: "FS-03", xp: 20, gold: 4, reqStr: 20,
    desc: "Two rounds. No hiding. 14 minutes of work.",
    exercises: [
      { name: "Jumping Jacks", duration: 60, instruction: "Full extension, full speed. Set the pace.", type: "work" },
      { name: "Push-ups", duration: 60, instruction: "Chest to floor, every single rep.", type: "work" },
      { name: "Bodyweight Squats", duration: 60, instruction: "Deep squats. Don't stop.", type: "work" },
      { name: "Plank", duration: 60, instruction: "Stone still. If you're shaking, it's working.", type: "work" },
      { name: "Rest", duration: 15, instruction: "15 seconds. That's all you get.", type: "rest" },
      { name: "Lunges", duration: 60, instruction: "Deep lunges, alternating. Control the descent.", type: "work" },
      { name: "Mountain Climbers", duration: 60, instruction: "Explosive. Drive those knees.", type: "work" },
      { name: "Burpees", duration: 45, instruction: "Full burpees. Chest hits the floor every time.", type: "work" },
      { name: "Superman Hold", duration: 45, instruction: "Arms and legs up. Squeeze everything.", type: "work" },
      { name: "Rest", duration: 15, instruction: "Round 2. This is where you're forged.", type: "rest" },
      { name: "Push-ups (R2)", duration: 45, instruction: "Your arms are screaming. Do it anyway.", type: "work" },
      { name: "Squats (R2)", duration: 45, instruction: "Legs are burning. Break parallel every rep.", type: "work" },
      { name: "Plank (R2)", duration: 45, instruction: "Your core is done. Hold it together. Literally.", type: "work" },
      { name: "Burpees (R2)", duration: 30, instruction: "Last exercise. Empty the tank.", type: "work" },
    ],
  },
  {
    name: "Obsidian", code: "OB-04", xp: 25, gold: 5, reqStr: 25,
    desc: "Two full circuits. A burnout finisher. 18 minutes.",
    exercises: [
      { name: "Burpees", duration: 60, instruction: "Hardest exercise first. Full reps, full effort.", type: "work" },
      { name: "Push-ups", duration: 60, instruction: "Chest to floor. No pausing at the top.", type: "work" },
      { name: "Jump Squats", duration: 60, instruction: "Squat deep, explode up. Land soft, go again.", type: "work" },
      { name: "Mountain Climbers", duration: 60, instruction: "Sprint pace. Knees to chest, relentless.", type: "work" },
      { name: "Plank", duration: 60, instruction: "Don't drop. Don't shift. Be the stone.", type: "work" },
      { name: "Lunges", duration: 60, instruction: "Deep and controlled. Every rep counts.", type: "work" },
      { name: "Superman Hold", duration: 45, instruction: "Back engaged, everything lifted. Endure.", type: "work" },
      { name: "Jumping Jacks", duration: 45, instruction: "Active recovery. Keep the heart rate up.", type: "work" },
      { name: "Rest", duration: 30, instruction: "30 seconds. Circuit 2 is identical.", type: "rest" },
      { name: "Burpees", duration: 60, instruction: "Same exercise, same time. Don't stop.", type: "work" },
      { name: "Push-ups", duration: 60, instruction: "Broken muscles, unbroken will.", type: "work" },
      { name: "Jump Squats", duration: 60, instruction: "Legs are gone. Find something deeper.", type: "work" },
      { name: "Mountain Climbers", duration: 60, instruction: "You've been here before. Finish it.", type: "work" },
      { name: "Plank", duration: 60, instruction: "Shaking is strength leaving your weakness.", type: "work" },
      { name: "Lunges", duration: 60, instruction: "Almost there. Every step is earned.", type: "work" },
      { name: "Superman Hold", duration: 45, instruction: "Hold. Just hold.", type: "work" },
      { name: "Jumping Jacks", duration: 45, instruction: "Last real exercise. Leave nothing.", type: "work" },
      { name: "MAX Push-ups", duration: 45, instruction: "As many as you can. Don't count. Just go.", type: "burnout" },
      { name: "MAX Burpees", duration: 45, instruction: "Final 45 seconds. Everything you have. GO.", type: "burnout" },
    ],
  },
];

export default function ForgeTheBodyFlow({ onBack, playerStats = {} }) {
  const [step, setStep] = useState("briefing");
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

  // ── Shared background ──
  const BgGlow = () => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 0,
      background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${AMBER_FAINT} 0%, transparent 70%)`,
    }} />
  );

  // ═══════════════════════════════════════
  // BRIEFING (replaces prep slides)
  // ═══════════════════════════════════════
  if (step === "briefing") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 120px", background: C.bg, animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgGlow />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => onBack(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: MONO }}>{"\u2190"} abort</button>

          {/* Protocol header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 8 }}>GUILD TRAINING PROTOCOL</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2 }}>The Forge</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: AMBER_DIM, marginTop: 6 }}>Physical Readiness {"\u2022"} Required Daily</div>
          </div>

          {/* Briefing text */}
          <div style={{ padding: "16px 18px", border: `1px solid ${AMBER_DIM}22`, marginBottom: 24, background: AMBER_FAINT }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: AMBER, lineHeight: 1.8 }}>
              Your guild requires its operators to maintain physical readiness. There are no shortcuts. Your body is the primary tool {"\u2014"} and tools that aren't maintained become liabilities.
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: AMBER_DIM, lineHeight: 1.8, marginTop: 12 }}>
              Select a protocol. Complete every exercise. Log the session.
            </div>
          </div>

          {/* Tier selection */}
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 1, marginBottom: 12 }}>SELECT PROTOCOL</div>
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

          {/* Actions */}
          <button onClick={() => { setExerciseIdx(0); setStep("transition"); }} style={{
            width: "100%", padding: "16px", border: `1px solid ${AMBER}55`, cursor: "pointer",
            background: AMBER_FAINT, fontFamily: MONO, color: AMBER, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ BEGIN SESSION {"\u2014"} {tier.name.toUpperCase()} ]</button>

          <button onClick={() => setShowResistance(true)} style={{
            width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, marginTop: 8, borderRadius: 0,
          }}>[ ABORT ]</button>

          {/* Resistance modal */}
          {showResistance && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${AMBER_DIM}44` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 1, marginBottom: 16 }}>{">> resistance_detected"}</div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: AMBER, lineHeight: 1.8, marginBottom: 16 }}>
                  The voice telling you to skip today is the same one that told you to skip yesterday. It will say the same thing tomorrow.
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: C.text, lineHeight: 1.8, marginBottom: 16 }}>
                  {tier.name} is {Math.ceil(totalDuration / 60)} minutes. Your guild needs you operational. Five minutes of movement changes everything.
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
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", background: C.bg, position: "relative" }}>
        <BgGlow />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 16 }}>{exerciseIdx + 1} / {tier.exercises.length}</div>
          <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: isRest ? C.textDim : C.text, marginBottom: 8 }}>{currentExercise.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 8 }}>{currentExercise.instruction}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: AMBER, fontWeight: 700, marginBottom: 24 }}>{formatTime(currentExercise.duration)}</div>

          {/* Progress dots */}
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
    const isStretch = currentExercise.type === "stretch";
    const progress = currentExercise.duration > 0 ? ((currentExercise.duration - displayTime) / currentExercise.duration) * 100 : 0;
    const urgentColor = displayTime <= 5 && !isRest ? "#ef4444" : null;

    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 24px 120px", position: "relative", background: C.bg,
      }}>
        <BgGlow />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 8 }}>{exerciseIdx + 1} / {tier.exercises.length}</div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: isBurnout ? "#ef4444" : isRest ? C.textDim : AMBER, marginBottom: 16, letterSpacing: 1 }}>{currentExercise.name}</div>

          {/* Timer */}
          <div style={{
            fontFamily: MONO, fontSize: 72, fontWeight: 700,
            color: urgentColor || C.text, marginBottom: 8, lineHeight: 1,
            transition: "color 0.3s ease",
          }}>{formatTime(displayTime)}</div>

          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>{currentExercise.instruction}</div>

          {/* Progress bar */}
          <div style={{ width: 280, height: 3, background: C.surfaceLight, overflow: "hidden", margin: "0 auto 16px" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: isBurnout ? "#ef4444" : isRest ? C.textDim : AMBER,
              transition: "width 0.5s linear",
            }} />
          </div>

          {/* Pause / Next */}
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

          {/* Overall progress */}
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
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", background: C.bg, position: "relative" }}>
        <BgGlow />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER_DIM, letterSpacing: 2, marginBottom: 16 }}>SESSION COMPLETE</div>

          <div style={{ fontFamily: MONO, fontSize: 48, color: C.green, fontWeight: 700, marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 4 }}>Physical Readiness: Confirmed</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: AMBER, marginBottom: 20 }}>{tier.code} {"\u2022"} {tier.name}</div>

          {/* Rewards */}
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

          {/* Quote */}
          <div style={{ padding: "14px 16px", border: `1px solid ${AMBER_DIM}22`, background: AMBER_FAINT, marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6 }}>"{quote.text}"</div>
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