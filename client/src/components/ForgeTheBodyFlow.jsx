import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";

const TIERS = [
  {
    name: "Warm Blood", emoji: "\u{1FA78}", xp: 10, gold: 2, reqStr: 0,
    desc: "Stretch and move. Build the habit.",
    exercises: [
      { name: "Neck Rolls", emoji: "\u{1F504}", duration: 20, instruction: "Slow circles, both directions. Release the tension.", type: "stretch" },
      { name: "Shoulder Stretch", emoji: "\u{1F646}", duration: 20, instruction: "Pull each arm across your chest. Hold and breathe.", type: "stretch" },
      { name: "Quad Stretch", emoji: "\u{1F9B5}", duration: 20, instruction: "Standing, pull each foot to your glute. Balance.", type: "stretch" },
      { name: "Hamstring Touch", emoji: "\u{1F938}", duration: 20, instruction: "Feet together, bend and reach for your toes. Don't bounce.", type: "stretch" },
      { name: "Hip Circles", emoji: "\u{1F501}", duration: 20, instruction: "Hands on hips, wide circles. Loosen up.", type: "stretch" },
      { name: "Standing Twists", emoji: "\u{1F300}", duration: 30, instruction: "Feet planted, twist your torso side to side. Arms swing loose. Rotate through the spine.", type: "stretch" },
      { name: "Push-ups", emoji: "\u{1F4AA}", duration: 30, instruction: "Wall or floor. Full range of motion. Scale as needed.", type: "work" },
      { name: "Bodyweight Squats", emoji: "\u{1F9B5}", duration: 30, instruction: "Feet shoulder-width, break parallel, drive up.", type: "work" },
      { name: "Crunches", emoji: "\u{1F525}", duration: 30, instruction: "Hands behind head, curl up, squeeze at the top.", type: "work" },
      { name: "Lunges", emoji: "\u{1F3CB}\uFE0F", duration: 30, instruction: "Alternate legs. Back knee to the ground.", type: "work" },
      { name: "Plank", emoji: "\u{1F9F1}", duration: 30, instruction: "Forearms down, body straight. Hold steady.", type: "work" },
      { name: "Jumping Jacks", emoji: "\u2B50", duration: 30, instruction: "Full extension, light on your feet. Finish strong.", type: "work" },
    ],
  },
  {
    name: "Iron Will", emoji: "\u{1F529}", xp: 15, gold: 3, reqStr: 15,
    desc: "The real work begins. 8 exercises, built-in rest.",
    exercises: [
      { name: "Jumping Jacks", emoji: "\u2B50", duration: 45, instruction: "Full extension \u2014 arms overhead, feet wide.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 10, instruction: "Breathe. Shake it out. Get ready.", type: "rest" },
      { name: "Push-ups", emoji: "\u{1F4AA}", duration: 45, instruction: "Chest to floor, full lockout. Scale to knees if needed.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 10, instruction: "Quick recovery. Stay standing.", type: "rest" },
      { name: "Bodyweight Squats", emoji: "\u{1F9B5}", duration: 45, instruction: "Break parallel, drive through your heels.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 10, instruction: "Almost halfway. Keep moving.", type: "rest" },
      { name: "Plank", emoji: "\u{1F9F1}", duration: 45, instruction: "Forearms down, body straight as a board.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 10, instruction: "Breathe deep. Refocus.", type: "rest" },
      { name: "Lunges", emoji: "\u{1F3CB}\uFE0F", duration: 45, instruction: "Alternate legs. Back knee kisses the ground.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 10, instruction: "You're past the halfway point.", type: "rest" },
      { name: "Mountain Climbers", emoji: "\u26F0\uFE0F", duration: 45, instruction: "Hands planted, drive knees to chest. Fast.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 10, instruction: "Two more. Dig in.", type: "rest" },
      { name: "Burpees", emoji: "\u{1F525}", duration: 30, instruction: "Drop, chest to floor, push up, jump. No half reps.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 10, instruction: "Last one. Give it everything.", type: "rest" },
      { name: "Superman Hold", emoji: "\u{1F9B8}", duration: 30, instruction: "Face down, arms and legs lifted. Squeeze your back.", type: "work" },
    ],
  },
  {
    name: "Forged Steel", emoji: "\u2694\uFE0F", xp: 20, gold: 4, reqStr: 20,
    desc: "Two rounds. No hiding. 14 minutes of pain.",
    exercises: [
      { name: "Jumping Jacks", emoji: "\u2B50", duration: 60, instruction: "Full extension, full speed. Set the pace.", type: "work" },
      { name: "Push-ups", emoji: "\u{1F4AA}", duration: 60, instruction: "Chest to floor, every single rep. No shortcuts.", type: "work" },
      { name: "Bodyweight Squats", emoji: "\u{1F9B5}", duration: 60, instruction: "Deep squats. Feel the burn, don't stop.", type: "work" },
      { name: "Plank", emoji: "\u{1F9F1}", duration: 60, instruction: "Stone still. If you're shaking, it's working.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 15, instruction: "15 seconds. That's all you get.", type: "rest" },
      { name: "Lunges", emoji: "\u{1F3CB}\uFE0F", duration: 60, instruction: "Deep lunges, alternating. Control the descent.", type: "work" },
      { name: "Mountain Climbers", emoji: "\u26F0\uFE0F", duration: 60, instruction: "Explosive. Drive those knees. Don't slow down.", type: "work" },
      { name: "Burpees", emoji: "\u{1F525}", duration: 45, instruction: "Full burpees. Chest hits the floor every time.", type: "work" },
      { name: "Superman Hold", emoji: "\u{1F9B8}", duration: 45, instruction: "Arms and legs up. Squeeze everything. Hold.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 15, instruction: "Round 2. This is where you're forged.", type: "rest" },
      { name: "Push-ups (Round 2)", emoji: "\u{1F4AA}", duration: 45, instruction: "Your arms are screaming. Do it anyway.", type: "work" },
      { name: "Squats (Round 2)", emoji: "\u{1F9B5}", duration: 45, instruction: "Legs are burning. Break parallel every rep.", type: "work" },
      { name: "Plank (Round 2)", emoji: "\u{1F9F1}", duration: 45, instruction: "Your core is done. Hold it together. Literally.", type: "work" },
      { name: "Burpees (Round 2)", emoji: "\u{1F525}", duration: 30, instruction: "Last exercise. Empty the tank.", type: "work" },
    ],
  },
  {
    name: "Obsidian", emoji: "\u{1F5A4}", xp: 25, gold: 5, reqStr: 25,
    desc: "Two full circuits. A burnout finisher. 18 minutes.",
    exercises: [
      { name: "Burpees", emoji: "\u{1F525}", duration: 60, instruction: "Hardest exercise first. Full reps, full effort.", type: "work" },
      { name: "Push-ups", emoji: "\u{1F4AA}", duration: 60, instruction: "Chest to floor. No pausing at the top.", type: "work" },
      { name: "Jump Squats", emoji: "\u{1F9B5}", duration: 60, instruction: "Squat deep, explode up. Land soft, go again.", type: "work" },
      { name: "Mountain Climbers", emoji: "\u26F0\uFE0F", duration: 60, instruction: "Sprint pace. Knees to chest, relentless.", type: "work" },
      { name: "Plank", emoji: "\u{1F9F1}", duration: 60, instruction: "Don't drop. Don't shift. Be the stone.", type: "work" },
      { name: "Lunges", emoji: "\u{1F3CB}\uFE0F", duration: 60, instruction: "Deep and controlled. Every rep counts.", type: "work" },
      { name: "Superman Hold", emoji: "\u{1F9B8}", duration: 45, instruction: "Back engaged, everything lifted. Endure.", type: "work" },
      { name: "Jumping Jacks", emoji: "\u2B50", duration: 45, instruction: "Active recovery. Keep the heart rate up.", type: "work" },
      { name: "Rest", emoji: "\u{1F4A8}", duration: 30, instruction: "30 seconds. Circuit 2 is identical. You know what's coming.", type: "rest" },
      { name: "Burpees", emoji: "\u{1F525}", duration: 60, instruction: "Same exercise, same time. Your body is begging to stop. Don't.", type: "work" },
      { name: "Push-ups", emoji: "\u{1F4AA}", duration: 60, instruction: "Broken muscles, unbroken will. Keep going.", type: "work" },
      { name: "Jump Squats", emoji: "\u{1F9B5}", duration: 60, instruction: "Legs are gone. Find something deeper.", type: "work" },
      { name: "Mountain Climbers", emoji: "\u26F0\uFE0F", duration: 60, instruction: "You've been here before. Finish what you started.", type: "work" },
      { name: "Plank", emoji: "\u{1F9F1}", duration: 60, instruction: "Shaking is strength leaving your weakness.", type: "work" },
      { name: "Lunges", emoji: "\u{1F3CB}\uFE0F", duration: 60, instruction: "Almost there. Every step is earned.", type: "work" },
      { name: "Superman Hold", emoji: "\u{1F9B8}", duration: 45, instruction: "Back is on fire. Hold. Just hold.", type: "work" },
      { name: "Jumping Jacks", emoji: "\u2B50", duration: 45, instruction: "Last real exercise. Leave nothing.", type: "work" },
      { name: "MAX Push-ups", emoji: "\u{1F480}", duration: 45, instruction: "As many as you can. Don't count. Just go.", type: "burnout" },
      { name: "MAX Burpees", emoji: "\u{1F480}", duration: 45, instruction: "Final 45 seconds. Everything you have left. GO.", type: "burnout" },
    ],
  },
];

export default function ForgeTheBodyFlow({ onBack, playerStats = {} }) {
  const [step, setStep] = useState("prep");
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [pauseOffset, setPauseOffset] = useState(0);
  const [exerciseFinished, setExerciseFinished] = useState(false);
  const tickRef = useRef(null);
  const pauseRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Bodyweight Workout"];
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
      if (remaining <= 0) {
        setExerciseFinished(true);
        clearInterval(tickRef.current);
      }
    };
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [step, exerciseStartTime, paused, exerciseIdx]);

  const startExercise = () => {
    setExerciseStartTime(Date.now());
    setPauseOffset(0);
    setPaused(false);
    setExerciseFinished(false);
    setDisplayTime(currentExercise.duration);
  };

  const togglePause = () => {
    if (paused) {
      setPauseOffset(prev => prev + (Date.now() - (pauseRef.current || Date.now())));
      setPaused(false);
    } else {
      pauseRef.current = Date.now();
      setPaused(true);
      clearInterval(tickRef.current);
    }
  };

  const nextExercise = () => {
    if (isLastExercise) {
      setStep("done");
    } else {
      setExerciseIdx(exerciseIdx + 1);
      setStep("transition");
    }
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0 ? `${min}:${sec.toString().padStart(2, '0')}` : `${sec}`;
  };

  const totalDuration = tier ? tier.exercises.reduce((s, e) => s + e.duration, 0) : 0;
  const completedDuration = tier ? tier.exercises.slice(0, exerciseIdx).reduce((s, e) => s + e.duration, 0) : 0;
  const overallProgress = ((completedDuration + (currentExercise ? currentExercise.duration - displayTime : 0)) / totalDuration) * 100;

  const BgLayer = () => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/forge-bg.png)",
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

  const slides = [
    { emoji: "\u2694\uFE0F", title: "Forge the Body", body: "There are no shortcuts. No hacks, no workarounds. Your body is the weapon \u2014 and weapons are forged in fire.", accent: null },
    { emoji: "\u{1F528}", title: "Choose Your Intensity", body: "Four tiers. Warm Blood is for building the habit. Obsidian is for those who've earned the right to suffer. Pick the tier that matches your level \u2014 or challenge yourself.", accent: "Harder tiers unlock as your Strength grows." },
    { emoji: "\u{1F525}", title: "How It Works", body: "Follow the guided exercises. A timer counts down each movement. Rest when it says rest. Push when it says push.", accent: "Every rep counts. Every set is earned." },
  ];
  const isLastSlide = prepSlide === slides.length - 1;

  if (step === "prep") {
    const slide = slides[prepSlide];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
          <button onClick={() => { if (prepSlide > 0) setPrepSlide(prepSlide - 1); else onBack(false); }} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>&#8592; Back</button>
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
                    <img src="/Socrates.png" alt="Socrates" style={{ width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated", filter: "brightness(1.1)" }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Face the Resistance</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>"{info.featuredQuote.text}"</div>
                    <div style={{ fontSize: 11, color: C.gold }}>&#8212; {info.featuredQuote.author}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>The voice telling you to skip today is the same voice that told you to skip yesterday. It will tell you the same thing tomorrow. At some point, you have to stop listening.</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>Five minutes. That's the lowest tier. Five minutes of movement will change your entire day.</p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>The forge is hot. Step in.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => { setShowWhy(false); setStep("tierSelect"); }} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "#22c55e", color: "#000" }}>You're Right &#8212; Let's Go</button>
                  <button onClick={() => { setShowWhy(false); onBack(false); }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "#ef4444", color: "#000" }}>Not Today</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "tierSelect") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("prep")} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>&#8592; Back</button>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Choose Your Tier</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>How hard are you going?</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Your STR: <span style={{ color: "#ef4444", fontWeight: 700 }}>{strLevel}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map((t, i) => {
              const locked = strLevel < t.reqStr;
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
                        {locked && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>{"\u{1F512}"} STR {t.reqStr}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>~{Math.ceil(t.exercises.reduce((s, e) => s + e.duration, 0) / 60)} min &#183; {t.xp} XP &#183; {t.gold} gold</div>
                    </div>
                    {selected && !locked && <span style={{ fontSize: 18, color: C.gold }}>{"\u2713"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => { setExerciseIdx(0); setStep("transition"); }} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, background: "#22c55e", color: "#000", marginTop: 20 }}>Start &#8212; {tier.name}</button>
        </div>
      </div>
    );
  }

  if (step === "transition" && currentExercise) {
    const isRest = currentExercise.type === "rest";
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 2, marginBottom: 8 }}>{exerciseIdx + 1} / {tier.exercises.length}</div>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{currentExercise.emoji}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: isRest ? "#60a5fa" : C.gold, marginBottom: 8 }}>{currentExercise.name}</div>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 8, maxWidth: 300, margin: "0 auto" }}>{currentExercise.instruction}</p>
          <div style={{ fontSize: 16, color: C.text, fontWeight: 700, marginBottom: 24 }}>{formatTime(currentExercise.duration)}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 24, flexWrap: "wrap", maxWidth: 300, margin: "0 auto 24px" }}>
            {tier.exercises.map((_, i) => (<div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < exerciseIdx ? C.ritualDone : i === exerciseIdx ? C.gold : C.surfaceLight }} />))}
          </div>
          <button onClick={() => { setStep("active"); startExercise(); }} style={{ padding: "18px 64px", borderRadius: 12, border: "none", cursor: "pointer", background: isRest ? "#60a5fa" : "#22c55e", color: "#000", fontSize: 18, fontWeight: 700 }}>{isRest ? "Rest" : "Start"}</button>
        </div>
      </div>
    );
  }

  if (step === "active" && currentExercise) {
    const isRest = currentExercise.type === "rest";
    const isBurnout = currentExercise.type === "burnout";
    const isStretch = currentExercise.type === "stretch";
    const progress = currentExercise.duration > 0 ? ((currentExercise.duration - displayTime) / currentExercise.duration) * 100 : 0;
    // Fire colors: alternate between deep red and dark orange for work exercises
    const fireColors = ["#1a0800", "#1a0400", "#1a0600"];
    const bgColor = isBurnout ? "#1a0000" : isRest ? "#0a0e1a" : isStretch ? "#1a1000" : fireColors[exerciseIdx % fireColors.length];
    const accentColor = isBurnout ? "#ef4444" : isRest ? "#60a5fa" : isStretch ? "#f59e0b" : exerciseIdx % 2 === 0 ? "#ef4444" : "#f97316";
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", position: "relative", background: bgColor, transition: "background 0.5s ease" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 2, marginBottom: 4 }}>{exerciseIdx + 1} / {tier.exercises.length}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: accentColor, marginBottom: 12, letterSpacing: 1 }}>{currentExercise.name}</div>
          <div style={{ fontSize: 72, fontWeight: 800, fontFamily: "monospace", color: displayTime <= 5 && !isRest ? "#ef4444" : C.text, marginBottom: 8 }}>{formatTime(displayTime)}</div>
          <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{currentExercise.instruction}</p>
          <div style={{ width: 280, height: 6, background: C.surfaceLight, borderRadius: 3, overflow: "hidden", margin: "0 auto 16px" }}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 3, background: isBurnout ? "#ef4444" : isRest ? "#60a5fa" : `linear-gradient(90deg, #ef4444, #f97316)`, transition: "width 0.5s linear" }} />
          </div>
          {!exerciseFinished && (
            <button onClick={togglePause} style={{ padding: "10px 32px", borderRadius: 10, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>{paused ? "Resume" : "Pause"}</button>
          )}
          {exerciseFinished && (
            <button onClick={nextExercise} style={{ padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer", background: isLastExercise ? `linear-gradient(135deg, ${C.ritualDone}, #16a34a)` : `linear-gradient(135deg, #f97316, #ef4444)`, color: isLastExercise ? "#fff" : "#000", fontSize: 16, fontWeight: 700, animation: "fadeIn 0.3s ease" }}>{isLastExercise ? "Finish Workout" : `Next: ${tier.exercises[exerciseIdx + 1]?.name}`}</button>
          )}
          <div style={{ marginTop: 24 }}>
            <div style={{ width: 280, height: 3, background: C.surfaceLight, borderRadius: 2, overflow: "hidden", margin: "0 auto" }}>
              <div style={{ width: `${overallProgress}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, #ef4444, #f97316, #f59e0b)`, transition: "width 0.5s linear" }} />
            </div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{tier.name}</div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{tier.emoji}</div>
          <div style={{ fontSize: 48, color: C.ritualDone, fontWeight: 800, fontFamily: "'Cinzel', serif", marginBottom: 8 }}>{"\u2713"}</div>
          <div style={{ fontSize: 20, color: C.ritualDone, fontWeight: 700, marginBottom: 4 }}>Ritual Complete!</div>
          <div style={{ fontSize: 14, color: C.gold, fontWeight: 600, marginBottom: 8 }}>{tier.name} conquered</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>{tier.xp}</div><div style={{ fontSize: 10, color: C.textDim }}>XP</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{tier.gold}</div><div style={{ fontSize: 10, color: C.textDim }}>Gold</div></div>
          </div>
          <div style={{ padding: "12px 20px", borderRadius: 10, display: "inline-block", background: C.card, border: `1px solid ${C.cardBorder}`, marginBottom: 32 }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>"{quote.text}"</span>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>&#8212; {quote.author}</div>
          </div>
          <div>
            <button onClick={() => onBack(true, { xp: tier.xp, gold: tier.gold })} style={{ padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`, color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1, boxShadow: `0 4px 20px ${C.ritualDone}44` }}>Claim +{tier.xp} XP</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}