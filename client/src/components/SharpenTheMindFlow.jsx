import { useState, useEffect, useRef } from "react";
import { C, getRandomQuote } from "../constants";
import { TOPICS } from "../readingContent";

const BLUE = "#4a6a94";
const BLUE_DIM = "#2d4060";
const BLUE_FAINT = "rgba(74, 106, 148, 0.08)";
const BLUE_LIGHT = "#6b9fd4";
const MONO = "'Courier New', 'Consolas', monospace";

const TIERS = [
  { name: "Skim", code: "SK-01", qCount: 2, timer: 0, xp: 10, gold: 2, reqInt: 0, desc: "2 easy questions. No time pressure." },
  { name: "Study", code: "SD-02", qCount: 3, timer: 0, xp: 15, gold: 3, reqInt: 15, desc: "3 questions. Prove you read it." },
  { name: "Scholar", code: "SC-03", qCount: 4, timer: 45, xp: 20, gold: 4, reqInt: 20, desc: "4 harder questions. 45 seconds each." },
  { name: "Sage's Trial", code: "ST-04", qCount: 5, timer: 30, xp: 25, gold: 5, reqInt: 25, desc: "5 questions. 30 seconds. No mercy." },
];

const ALDRIC_QUOTES = [
  "Knowledge is the only weapon that gets sharper with use. Read.",
  "A book is a dead strategist's best argument. Your job is to find the flaw in it.",
  "The guild that hoards knowledge outlasts the guild that hoards gold.",
  "What you read today becomes the decision you make under pressure tomorrow.",
  "Ignorance isn't neutral. It's a vulnerability your enemies will exploit.",
  "The scriptorium survived the collapse. Libraries outlast empires. Read.",
  "Twenty minutes of reading is twenty minutes of competitive advantage.",
];

function ArchiveBg({ opacity = 1 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "url(/intel-archive.png)", backgroundSize: "cover", backgroundPosition: "center",
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

export default function SharpenTheMindFlow({ onBack, playerStats = {}, completedArticles = [], userId = "" }) {
  const [step, setStep] = useState("intro1");
  const [showResistance, setShowResistance] = useState(false);
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

  const quote = getRandomQuote("Read 20min");
  const aldricQuote = ALDRIC_QUOTES[getDaySeed(userId) % ALDRIC_QUOTES.length];
  const tier = TIERS[selectedTier];
  const intLevel = playerStats.int || 10;

  useEffect(() => {
    if (!qTimerActive || tier.timer === 0) return;
    timerRef.current = setInterval(() => {
      setQTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setQTimerActive(false); setTimedOut(p => ({ ...p, [currentQIdx]: true })); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qTimerActive, currentQIdx]);

  const startQuestionTimer = (idx) => { setCurrentQIdx(idx); if (tier.timer > 0) { setQTimer(tier.timer); setQTimerActive(true); } };
  const getScore = () => { if (!selectedArticle) return 0; return selectedArticle.questions.slice(0, tier.qCount).reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0); };
  const passThreshold = Math.ceil(tier.qCount * 0.6);

  // ═══════════════════════════════════════
  // SLIDE 1: THE COMPACT'S MANDATE
  // ═══════════════════════════════════════
  if (step === "intro1") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <ArchiveBg opacity={0.3} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: BLUE_DIM, letterSpacing: 3, marginBottom: 32, textTransform: "uppercase" }}>The Compact {"\u2014"} Contractor Protocol</div>

          <div style={{ fontSize: 13, color: C.text, lineHeight: 2, fontFamily: "'Inter', sans-serif", marginBottom: 48 }}>
            Contractors who stop learning become obsolete. The Compact does not employ obsolete operators.
            <span style={{ display: "block", height: 16 }} />
            Intelligence is not a talent. It is a discipline maintained through daily study.
            <span style={{ display: "block", height: 16 }} />
            <span style={{ color: BLUE_LIGHT }}>Read. Comprehend. Prove it.</span>
          </div>

          <button onClick={() => setStep("intro2")} style={{
            padding: "14px 48px", border: `1px solid ${BLUE}44`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: BLUE_LIGHT, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ACKNOWLEDGED ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SLIDE 2: ALDRIC INTRODUCTION
  // ═══════════════════════════════════════
  if (step === "intro2") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", background: "#050505", position: "relative", animation: "fadeIn 0.5s ease" }}>
        <ArchiveBg opacity={0.2} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 340 }}>
          <div style={{ marginBottom: 20 }}>
            <img src="/aldric-portrait.png" alt="Aldric" style={{
              width: 160, height: 160, objectFit: "cover", borderRadius: "50%",
              border: `2px solid ${BLUE}33`,
            }} onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_LIGHT, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>Intel Protocol Director</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: 2, marginBottom: 20 }}>Aldric</div>

          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 2, fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 40, padding: "0 8px" }}>
            "{aldricQuote}"
          </div>

          <button onClick={() => setStep("tierSelect")} style={{
            padding: "14px 48px", border: `1px solid ${BLUE}44`, cursor: "pointer",
            background: BLUE_FAINT, fontFamily: MONO, color: BLUE_LIGHT, fontSize: 13, fontWeight: 600,
            letterSpacing: 1, borderRadius: 0,
          }}>[ ENTER THE ARCHIVE ]</button>
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
        <ArchiveBg opacity={0.1} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => onBack(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: MONO }}>{"\u2190"} abort</button>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM, letterSpacing: 2, marginBottom: 8 }}>INTEL PROTOCOL</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2 }}>How Deep Are You Going?</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: BLUE_DIM, marginTop: 6 }}>INT: {intLevel}</div>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM, letterSpacing: 1, marginBottom: 12 }}>PROTOCOL TIER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {TIERS.map((t, i) => {
              const locked = intLevel < t.reqInt;
              const selected = selectedTier === i;
              return (
                <div key={i} onClick={() => { if (!locked) setSelectedTier(i); }} style={{
                  padding: "14px 16px", cursor: locked ? "default" : "pointer",
                  background: selected && !locked ? BLUE_FAINT : "transparent",
                  border: `1px solid ${selected && !locked ? BLUE + '44' : C.border}`,
                  opacity: locked ? 0.3 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM }}>{t.code}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: selected ? BLUE_LIGHT : C.text }}>{t.name}</span>
                        {locked && <span style={{ fontFamily: MONO, fontSize: 9, color: "#ef4444" }}>LOCKED {"\u2014"} INT {t.reqInt}</span>}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t.desc}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 4 }}>{t.qCount} questions{t.timer > 0 ? ` \u00B7 ${t.timer}s each` : ""} {"\u00B7"} {t.xp}xp {"\u00B7"} {t.gold}g</div>
                    </div>
                    {selected && !locked && <span style={{ fontFamily: MONO, fontSize: 14, color: BLUE_LIGHT }}>{"\u25C9"}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => setStep("topics")} style={{
            width: "100%", padding: "16px", border: `1px solid ${BLUE}55`, cursor: "pointer",
            background: BLUE_FAINT, fontFamily: MONO, color: BLUE_LIGHT, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ CHOOSE A TOPIC ]</button>

          <button onClick={() => setShowResistance(true)} style={{
            width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, marginTop: 8, borderRadius: 0,
          }}>[ NOT TODAY ]</button>

          {showResistance && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, background: "#0a0a0a", border: `1px solid ${BLUE_DIM}44` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM, letterSpacing: 1, marginBottom: 16 }}>ALDRIC:</div>
                <div style={{ fontSize: 13, color: BLUE_LIGHT, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  The pull to close this and scroll something easier is your brain protecting its energy. Override it.
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.9, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  Ten minutes. One article. The knowledge compounds whether you notice or not.
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: BLUE_LIGHT, fontWeight: 600, marginBottom: 20 }}>
                  The archive is open. Step in.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { setShowResistance(false); setStep("topics"); }} style={{ width: "100%", padding: "14px", border: `1px solid ${BLUE}55`, cursor: "pointer", background: BLUE_FAINT, fontFamily: MONO, color: BLUE_LIGHT, fontSize: 13, fontWeight: 600, borderRadius: 0 }}>[ PROCEED ]</button>
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
  // TOPICS
  // ═══════════════════════════════════════
  if (step === "topics") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ArchiveBg opacity={0.08} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("tierSelect")} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, fontFamily: MONO }}>{"\u2190"} back</button>
          <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM, letterSpacing: 2, marginBottom: 8 }}>{tier.code} {"\u2022"} {tier.name}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20 }}>What Will You Study?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TOPICS.map(topic => {
              const available = topic.articles.filter(a => a.content && !completedArticles.includes(a.id));
              const completed = topic.articles.filter(a => completedArticles.includes(a.id)).length;
              const total = topic.articles.length;
              return (
                <div key={topic.id} onClick={() => { if (available.length > 0) { setSelectedTopic(topic); setStep("articles"); } }} style={{
                  padding: "14px 16px", cursor: available.length > 0 ? "pointer" : "default",
                  background: "transparent", border: `1px solid ${available.length > 0 ? BLUE + '33' : C.border}`,
                  borderLeft: `3px solid ${topic.color}`,
                  opacity: available.length > 0 ? 1 : 0.4,
                }}>
                  <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>{topic.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: topic.color, marginTop: 2 }}>{topic.subtitle}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 4 }}>
                    {completed === total ? "\u2713 All complete" : `${completed}/${total} complete \u00B7 ${available.length} remaining`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // ARTICLES
  // ═══════════════════════════════════════
  if (step === "articles" && selectedTopic) {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ArchiveBg opacity={0.08} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => { setSelectedTopic(null); setStep("topics"); }} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, fontFamily: MONO }}>{"\u2190"} back</button>
          <div style={{ fontFamily: MONO, fontSize: 10, color: selectedTopic.color, letterSpacing: 2, marginBottom: 8 }}>{selectedTopic.name}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 16 }}>Select an Article</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {selectedTopic.articles.map((a, i) => {
              const done = completedArticles.includes(a.id);
              return (
                <div key={a.id} onClick={() => { if (!done && a.content) { setSelectedArticle(a); setAnswers({}); setSubmitted(false); setTimedOut({}); setStep("reading"); } }} style={{
                  padding: "14px 16px", cursor: done ? "default" : "pointer",
                  background: done ? "rgba(74,124,80,0.08)" : "transparent",
                  border: `1px solid ${done ? C.green + "33" : C.border}`,
                  opacity: done ? 0.5 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: MONO, fontSize: 11, fontWeight: 700, flexShrink: 0,
                      color: done ? C.green : BLUE_LIGHT, border: `1px solid ${done ? C.green + "44" : BLUE + "44"}`,
                    }}>{done ? "\u2713" : i + 1}</div>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: done ? C.green : C.text }}>{a.title}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginTop: 2 }}>{a.subtitle}</div>
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

  // ═══════════════════════════════════════
  // READING
  // ═══════════════════════════════════════
  if (step === "reading" && selectedArticle) {
    const paragraphs = selectedArticle.content.trim().split("\n\n");
    const wordCount = selectedArticle.content.split(/\s+/).length;
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ArchiveBg opacity={0.06} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setStep("articles")} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: MONO }}>{"\u2190"} back</button>

          <div style={{ fontFamily: MONO, fontSize: 10, color: selectedTopic.color, letterSpacing: 2, marginBottom: 8 }}>{selectedTopic.name}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: BLUE_LIGHT, lineHeight: 1.3, marginBottom: 6 }}>{selectedArticle.title}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, fontStyle: "italic", marginBottom: 6 }}>{selectedArticle.subtitle}</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginBottom: 24 }}>~{Math.ceil(wordCount / 200)} min read {"\u00B7"} {tier.code}: {tier.qCount} questions{tier.timer > 0 ? ` (${tier.timer}s each)` : ""}</div>

          <div style={{ padding: "20px 18px", background: BLUE_FAINT, border: `1px solid ${BLUE}22`, marginBottom: 24 }}>
            {paragraphs.map((p, i) => (<p key={i} style={{ fontSize: 14, color: C.text, lineHeight: 1.9, fontFamily: "'Inter', sans-serif", marginBottom: i < paragraphs.length - 1 ? 18 : 0 }}>{p}</p>))}
          </div>

          <button onClick={() => { setStep("quiz"); setCurrentQIdx(0); if (tier.timer > 0) startQuestionTimer(0); window.scrollTo(0, 0); }} style={{
            width: "100%", padding: "16px", border: `1px solid ${BLUE}55`, cursor: "pointer",
            background: BLUE_FAINT, fontFamily: MONO, color: BLUE_LIGHT, fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
          }}>[ I'VE READ IT {"\u2014"} TAKE THE QUIZ ]</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // QUIZ
  // ═══════════════════════════════════════
  if (step === "quiz" && selectedArticle) {
    const questions = selectedArticle.questions.slice(0, tier.qCount);
    const allAnswered = questions.every((_, i) => answers[i] !== undefined || timedOut[i]);
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 18px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ArchiveBg opacity={0.06} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => { setStep("reading"); setAnswers({}); setSubmitted(false); setTimedOut({}); clearInterval(timerRef.current); }} style={{ background: "none", border: "none", color: C.textDim, fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, fontFamily: MONO }}>{"\u2190"} back to article</button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM, letterSpacing: 2 }}>QUIZ {"\u2014"} {tier.code}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: C.text, marginTop: 4 }}>{selectedArticle.title}</div>
            </div>
            {tier.timer > 0 && qTimerActive && (
              <div style={{ padding: "6px 14px", border: `1px solid ${qTimer <= 10 ? "#ef444444" : BLUE + "44"}` }}>
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: qTimer <= 10 ? "#ef4444" : BLUE_LIGHT }}>{qTimer}s</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {questions.map((q, qIdx) => {
              const isActive = !submitted && qIdx === currentQIdx;
              const hasTimedOut = timedOut[qIdx];
              return (
                <div key={qIdx} style={{ padding: "16px", background: BLUE_FAINT, border: `1px solid ${BLUE}22`, opacity: (!submitted && qIdx > currentQIdx) ? 0.3 : 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, lineHeight: 1.5 }}>{qIdx + 1}. {q.q}</div>
                  {hasTimedOut && answers[qIdx] === undefined && !submitted && (
                    <div style={{ fontFamily: MONO, color: "#ef4444", fontSize: 11, marginBottom: 8, fontWeight: 600 }}>Time's up!</div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = answers[qIdx] === oIdx;
                      const isCorrect = submitted && oIdx === q.answer;
                      const isWrong = submitted && isSelected && oIdx !== q.answer;
                      let bg = "transparent", border = `1px solid ${C.border}`, textColor = C.text;
                      if (isSelected && !submitted) { bg = BLUE_FAINT; border = `1px solid ${BLUE_LIGHT}`; textColor = BLUE_LIGHT; }
                      if (isCorrect) { bg = "rgba(74,124,80,0.15)"; border = `1px solid ${C.green}`; textColor = C.green; }
                      if (isWrong) { bg = "rgba(239,68,68,0.1)"; border = "1px solid #ef4444"; textColor = "#ef4444"; }
                      const canClick = isActive && !hasTimedOut && !submitted;
                      return (
                        <div key={oIdx} onClick={() => {
                          if (!canClick) return;
                          setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                          clearInterval(timerRef.current); setQTimerActive(false);
                          setTimeout(() => {
                            if (qIdx < questions.length - 1) {
                              setCurrentQIdx(qIdx + 1);
                              if (tier.timer > 0) startQuestionTimer(qIdx + 1);
                              const el = document.getElementById(`q-${qIdx + 1}`);
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 400);
                        }} style={{ padding: "10px 14px", background: bg, border, cursor: canClick ? "pointer" : "default" }}>
                          <span style={{ fontFamily: MONO, fontSize: 12, color: textColor }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {qIdx < questions.length - 1 && <div id={`q-${qIdx + 1}`} />}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }}>
            {!submitted ? (
              <button onClick={() => { if (allAnswered) setSubmitted(true); }} disabled={!allAnswered} style={{
                width: "100%", padding: "16px", border: `1px solid ${allAnswered ? BLUE + '55' : C.border}`,
                cursor: allAnswered ? "pointer" : "default", background: allAnswered ? BLUE_FAINT : "transparent",
                fontFamily: MONO, color: allAnswered ? BLUE_LIGHT : C.textDim, fontSize: 14, fontWeight: 600, borderRadius: 0,
                opacity: allAnswered ? 1 : 0.4,
              }}>[ SUBMIT ANSWERS ]</button>
            ) : (
              <button onClick={() => setStep("score")} style={{
                width: "100%", padding: "16px", border: `1px solid ${C.green}55`, cursor: "pointer",
                background: "rgba(74,124,80,0.1)", fontFamily: MONO, color: C.green, fontSize: 14, fontWeight: 600, borderRadius: 0,
              }}>[ SEE RESULTS ]</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SCORE
  // ═══════════════════════════════════════
  if (step === "score" && selectedArticle) {
    const score = getScore();
    const passed = score >= passThreshold;
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 100px", background: "#050505", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <ArchiveBg opacity={0.15} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM, letterSpacing: 2, marginBottom: 16 }}>{passed ? "INTEL COMPLETE" : "INSUFFICIENT"}</div>

          <div style={{ fontFamily: MONO, fontSize: 48, color: passed ? C.green : "#f59e0b", fontWeight: 700, marginBottom: 8 }}>{score}/{tier.qCount}</div>
          <div style={{ fontSize: 18, color: passed ? C.text : "#f59e0b", fontWeight: 600, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
            {passed ? "Intelligence Readiness: Confirmed" : "Review Required"}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: BLUE_LIGHT, marginBottom: 4 }}>{tier.code} {"\u2022"} {tier.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
            {passed ? `"${selectedArticle.title}"` : `You need ${passThreshold} correct. Review and try again.`}
          </div>

          {passed && (
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: BLUE_LIGHT }}>{tier.xp}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>XP</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.green }}>{tier.gold}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: 1 }}>GOLD</div>
              </div>
            </div>
          )}

          <div style={{ padding: "14px 16px", border: `1px solid ${BLUE_DIM}22`, background: BLUE_FAINT, marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>"{quote.text}"</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: BLUE_DIM, marginTop: 6 }}>{"\u2014"} {quote.author}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {passed ? (
              <button onClick={() => onBack(true, { xp: tier.xp, gold: tier.gold, articleId: selectedArticle.id })} style={{
                padding: "16px 48px", border: `1px solid ${C.green}55`, cursor: "pointer",
                background: "rgba(74, 124, 80, 0.1)", fontFamily: MONO, color: C.green,
                fontSize: 14, fontWeight: 600, letterSpacing: 1, borderRadius: 0,
              }}>[ LOG SESSION {"\u2014"} +{tier.xp} XP ]</button>
            ) : (
              <>
                <button onClick={() => { setStep("reading"); setAnswers({}); setSubmitted(false); setTimedOut({}); window.scrollTo(0, 0); }} style={{
                  width: "100%", padding: "14px", border: `1px solid ${BLUE}55`, cursor: "pointer",
                  background: BLUE_FAINT, fontFamily: MONO, color: BLUE_LIGHT, fontSize: 13, fontWeight: 600, borderRadius: 0,
                }}>[ RE-READ THE ARTICLE ]</button>
                <button onClick={() => { setAnswers({}); setSubmitted(false); setTimedOut({}); setCurrentQIdx(0); setStep("quiz"); if (tier.timer > 0) startQuestionTimer(0); window.scrollTo(0, 0); }} style={{
                  width: "100%", padding: "12px", border: `1px solid ${C.border}`, cursor: "pointer",
                  background: "transparent", fontFamily: MONO, color: C.textDim, fontSize: 12, borderRadius: 0,
                }}>[ RETRY QUIZ ]</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}