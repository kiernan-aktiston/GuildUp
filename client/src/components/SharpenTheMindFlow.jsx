import { useState, useEffect, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";
import { TOPICS } from "../readingContent";

const TIERS = [
  { name: "Skim", emoji: "\u{1F4D6}", qCount: 2, timer: 0, xp: 10, gold: 2, reqInt: 0, desc: "2 easy questions. No time pressure." },
  { name: "Study", emoji: "\u{1F4DA}", qCount: 3, timer: 0, xp: 15, gold: 3, reqInt: 15, desc: "3 questions. Prove you read it." },
  { name: "Scholar", emoji: "\u{1F393}", qCount: 4, timer: 45, xp: 20, gold: 4, reqInt: 20, desc: "4 harder questions. 45 seconds each." },
  { name: "Sage's Trial", emoji: "\u{1F9D9}", qCount: 5, timer: 30, xp: 25, gold: 5, reqInt: 25, desc: "5 questions. 30 seconds. No mercy." },
];

export default function SharpenTheMindFlow({ onBack, playerStats = {}, completedArticles = [] }) {
  const [step, setStep] = useState("prep");
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [qTimer, setQTimer] = useState(0);
  const [qTimerActive, setQTimerActive] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timedOut, setTimedOut] = useState({});
  const timerRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Read 20min"];
  const quote = getRandomQuote("Read 20min");
  const tier = TIERS[selectedTier];
  const intLevel = playerStats.int || 10;

  // Question timer for Scholar and Sage's Trial
  useEffect(() => {
    if (!qTimerActive || tier.timer === 0) return;
    timerRef.current = setInterval(() => {
      setQTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setQTimerActive(false);
          setTimedOut(p => ({ ...p, [currentQIdx]: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qTimerActive, currentQIdx]);

  const startQuestionTimer = (idx) => {
    setCurrentQIdx(idx);
    if (tier.timer > 0) {
      setQTimer(tier.timer);
      setQTimerActive(true);
    }
  };

  const getScore = () => {
    if (!selectedArticle) return 0;
    const qs = selectedArticle.questions.slice(0, tier.qCount);
    return qs.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  };

  const passThreshold = Math.ceil(tier.qCount * 0.6);

  const BgLayer = () => (
    <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, height: "100vh", backgroundImage: "url(/sharpen-bg.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.3, pointerEvents: "none", zIndex: 0 }} />
  );

  const btnPrimary = { width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#000" };

  // ── PREP SLIDES ──
  const slides = [
    { emoji: "\u{1F4D6}", title: "Sharpen the Mind", body: "The most dangerous man in any room is the one who reads. Knowledge compounds silently \u2014 and one day, everyone notices.", accent: null },
    { emoji: "\u{1F9E0}", title: "Choose Your Challenge", body: "Four tiers. Skim for a quick read, or face the Sage's Trial \u2014 five hard questions with a 30-second clock. Higher tiers unlock as your Intelligence grows.", accent: "Harder tiers mean harder questions and more XP." },
    { emoji: "\u{1F4DD}", title: "Read. Think. Prove It.", body: "Pick a topic. Read the article carefully. Then answer the quiz to prove you understood. No skimming. No guessing.", accent: "You must pass to earn XP." },
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
                    <img src="/Descartes.png" alt="Descartes" style={{ width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated", filter: "brightness(1.1)" }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Face the Resistance</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>"{info.featuredQuote.text}"</div>
                    <div style={{ fontSize: 11, color: C.gold }}>{"\u2014"} {info.featuredQuote.author}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>The pull to close this and scroll something easier is your brain protecting its energy. Override it.</p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>Ten minutes. One article. Start.</p>
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>How deep are you going?</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Your INT: <span style={{ color: "#3b82f6", fontWeight: 700 }}>{intLevel}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map((t, i) => {
              const locked = intLevel < t.reqInt;
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
                        {locked && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>{"\u{1F512}"} INT {t.reqInt}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{t.qCount} questions{t.timer > 0 ? ` \u00B7 ${t.timer}s each` : ""} {"\u00B7"} {t.xp} XP {"\u00B7"} {t.gold} gold</div>
                    </div>
                    {selected && !locked && <span style={{ fontSize: 18, color: C.gold }}>{"\u2713"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setStep("topics")} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, background: "#22c55e", color: "#000", marginTop: 20 }}>Choose a Topic</button>
        </div>
      </div>
    );
  }

  // ── TOPIC SELECTION ──
  if (step === "topics") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("tierSelect")} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>{"\u2190"} Back</button>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Choose Your Track</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20 }}>What will you study?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TOPICS.map(topic => {
              const available = topic.articles.filter(a => a.content && !completedArticles.includes(a.id));
              const completed = topic.articles.filter(a => completedArticles.includes(a.id)).length;
              const total = topic.articles.length;
              return (
                <div key={topic.id} onClick={() => { if (available.length > 0) { setSelectedTopic(topic); setStep("articles"); } }} style={{
                  padding: "16px 18px", borderRadius: 14, cursor: available.length > 0 ? "pointer" : "default",
                  background: C.card, border: `1px solid ${C.cardBorder}`, borderLeft: `4px solid ${topic.color}`,
                  opacity: available.length > 0 ? 1 : 0.5, transition: "all 0.2s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 32 }}>{topic.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{topic.name}</div>
                      <div style={{ fontSize: 12, color: topic.color, fontWeight: 600 }}>{topic.subtitle}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                        {completed === total ? "\u2713 All complete" : `${completed}/${total} complete \u00B7 ${available.length} remaining`}
                      </div>
                    </div>
                    {available.length > 0 && <span style={{ fontSize: 18, color: C.textMuted }}>{"\u2192"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── ARTICLE LIST ──
  if (step === "articles" && selectedTopic) {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => { setSelectedTopic(null); setStep("topics"); }} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>{"\u2190"} Back to Topics</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>{selectedTopic.emoji}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{selectedTopic.name}</div>
              <div style={{ fontSize: 12, color: selectedTopic.color }}>{selectedTopic.subtitle}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedTopic.articles.map((a, i) => {
              const done = completedArticles.includes(a.id);
              return (
                <div key={a.id} onClick={() => { if (!done && a.content) { setSelectedArticle(a); setAnswers({}); setSubmitted(false); setTimedOut({}); setStep("reading"); } }} style={{
                  padding: "14px 16px", borderRadius: 12, cursor: done ? "default" : "pointer",
                  background: done ? "rgba(34, 197, 94, 0.1)" : C.card,
                  border: `1px solid ${done ? "rgba(34, 197, 94, 0.3)" : C.cardBorder}`,
                  opacity: done ? 0.6 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#22c55e" : C.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: done ? "#000" : C.textDim, flexShrink: 0 }}>
                      {done ? "\u2713" : i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: done ? "#22c55e" : C.text }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{a.subtitle}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── READING ──
  if (step === "reading" && selectedArticle) {
    const paragraphs = selectedArticle.content.trim().split("\n\n");
    const wordCount = selectedArticle.content.split(/\s+/).length;
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("articles")} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>{"\u2190"} Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>{selectedTopic.emoji}</span>
            <span style={{ fontSize: 11, color: selectedTopic.color, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{selectedTopic.name}</span>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.gold, lineHeight: 1.3, marginBottom: 6 }}>{selectedArticle.title}</div>
            <div style={{ fontSize: 14, color: C.textMuted, fontStyle: "italic" }}>{selectedArticle.subtitle}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>~{Math.ceil(wordCount / 200)} min read {"\u00B7"} {tier.name}: {tier.qCount} questions{tier.timer > 0 ? ` (${tier.timer}s each)` : ""}</div>
          </div>
          <div style={{ padding: "20px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(8px)", marginBottom: 24 }}>
            {paragraphs.map((p, i) => (<p key={i} style={{ fontSize: 15, color: C.text, lineHeight: 1.9, marginBottom: i < paragraphs.length - 1 ? 18 : 0 }}>{p}</p>))}
          </div>
          <button onClick={() => { setStep("quiz"); setCurrentQIdx(0); if (tier.timer > 0) startQuestionTimer(0); window.scrollTo(0, 0); }} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "#22c55e", color: "#000" }}>
            I've Read It {"\u2014"} Take the Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (step === "quiz" && selectedArticle) {
    const questions = selectedArticle.questions.slice(0, tier.qCount);
    const allAnswered = questions.every((_, i) => answers[i] !== undefined || timedOut[i]);
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => { setStep("reading"); setAnswers({}); setSubmitted(false); setTimedOut({}); clearInterval(timerRef.current); }} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}>{"\u2190"} Back to Article</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Quiz {"\u2014"} {tier.name}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: C.text }}>{selectedArticle.title}</div>
            </div>
            {tier.timer > 0 && qTimerActive && (
              <div style={{ padding: "6px 14px", borderRadius: 10, background: qTimer <= 10 ? "rgba(239,68,68,0.2)" : C.surfaceLight }}>
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "monospace", color: qTimer <= 10 ? "#ef4444" : C.gold }}>{qTimer}s</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {questions.map((q, qIdx) => {
              const isActive = !submitted && qIdx === currentQIdx;
              const hasTimedOut = timedOut[qIdx];
              return (
                <div key={qIdx} style={{ padding: "16px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}`, opacity: (!submitted && qIdx > currentQIdx) ? 0.4 : 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12, lineHeight: 1.5 }}>{qIdx + 1}. {q.q}</div>
                  {hasTimedOut && answers[qIdx] === undefined && !submitted && (
                    <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>Time's up!</div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = answers[qIdx] === oIdx;
                      const isCorrect = submitted && oIdx === q.answer;
                      const isWrong = submitted && isSelected && oIdx !== q.answer;
                      let bg = C.surfaceLight, border = `1px solid ${C.border}`, textColor = C.text;
                      if (isSelected && !submitted) { bg = `${C.gold}22`; border = `2px solid ${C.gold}`; textColor = C.gold; }
                      if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "2px solid #22c55e"; textColor = "#22c55e"; }
                      if (isWrong) { bg = "rgba(239,68,68,0.15)"; border = "2px solid #ef4444"; textColor = "#ef4444"; }
                      const canClick = isActive && !hasTimedOut && !submitted;
                      return (
                        <div key={oIdx} onClick={() => {
                          if (!canClick) return;
                          setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                          clearInterval(timerRef.current);
                          setQTimerActive(false);
                          // Auto-advance to next question
                          setTimeout(() => {
                            if (qIdx < questions.length - 1) {
                              setCurrentQIdx(qIdx + 1);
                              if (tier.timer > 0) startQuestionTimer(qIdx + 1);
                              const el = document.getElementById(`q-${qIdx + 1}`);
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 400);
                        }} style={{ padding: "12px 14px", borderRadius: 10, background: bg, border, cursor: canClick ? "pointer" : "default", transition: "all 0.2s ease" }}>
                          <span style={{ fontSize: 14, color: textColor, lineHeight: 1.4 }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {qIdx < questions.length - 1 && <div id={`q-${qIdx + 1}`} />}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 24 }}>
            {!submitted ? (
              <button onClick={() => { if (allAnswered) setSubmitted(true); }} disabled={!allAnswered} style={{ ...btnPrimary, opacity: allAnswered ? 1 : 0.4, cursor: allAnswered ? "pointer" : "default" }}>Submit Answers</button>
            ) : (
              <button onClick={() => setStep("score")} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "#22c55e", color: "#000" }}>See Results</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SCORE ──
  if (step === "score" && selectedArticle) {
    const score = getScore();
    const passed = score >= passThreshold;
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{tier.emoji}</div>
          <div style={{ fontSize: 48, color: passed ? C.ritualDone : "#f59e0b", fontWeight: 800, fontFamily: "'Cinzel', serif", marginBottom: 8 }}>{score}/{tier.qCount}</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: passed ? C.ritualDone : "#f59e0b" }}>{passed ? "Ritual Complete!" : "Almost There"}</div>
          <div style={{ fontSize: 14, color: C.gold, fontWeight: 600, marginBottom: 8 }}>{tier.name}</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>
            {passed ? `You understood "${selectedArticle.title}"` : `You need at least ${passThreshold} correct. Review and try again.`}
          </div>
          {passed && (
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>{tier.xp}</div><div style={{ fontSize: 10, color: C.textDim }}>XP</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{tier.gold}</div><div style={{ fontSize: 10, color: C.textDim }}>Gold</div></div>
            </div>
          )}
          <div style={{ padding: "12px 20px", borderRadius: 10, display: "inline-block", background: C.card, border: `1px solid ${C.cardBorder}`, marginBottom: 32 }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>"{quote.text}"</span>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{"\u2014"} {quote.author}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {passed ? (
              <button onClick={() => onBack(true, { xp: tier.xp, gold: tier.gold, articleId: selectedArticle.id })} style={{ padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`, color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1, boxShadow: `0 4px 20px ${C.ritualDone}44` }}>
                Claim +{tier.xp} XP
              </button>
            ) : (
              <>
                <button onClick={() => { setStep("reading"); setAnswers({}); setSubmitted(false); setTimedOut({}); window.scrollTo(0, 0); }} style={{ padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#000", fontSize: 15, fontWeight: 700 }}>Re-read the Article</button>
                <button onClick={() => { setAnswers({}); setSubmitted(false); setTimedOut({}); setCurrentQIdx(0); setStep("quiz"); if (tier.timer > 0) startQuestionTimer(0); window.scrollTo(0, 0); }} style={{ padding: "14px 48px", borderRadius: 12, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.textMuted, fontSize: 14, fontWeight: 600 }}>Retry Quiz</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}