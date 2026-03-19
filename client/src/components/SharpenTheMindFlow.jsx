import { useState, useRef } from "react";
import { C, RITUAL_INSTRUCTIONS, getRandomQuote } from "../constants";
import { TOPICS } from "../readingContent";

export default function SharpenTheMindFlow({ onBack }) {
  const [step, setStep] = useState("prep"); // prep, topics, reading, quiz, score, done
  const [prepSlide, setPrepSlide] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef(null);

  const info = RITUAL_INSTRUCTIONS["Read 20min"];
  const quote = getRandomQuote("Read 20min");

  // Count correct answers
  const getScore = () => {
    if (!selectedArticle) return 0;
    return selectedArticle.questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.answer ? 1 : 0);
    }, 0);
  };

  const BgLayer = () => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/sharpen-bg.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      opacity: 0.15, pointerEvents: "none", zIndex: 0,
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
    {
      emoji: "📖",
      title: "Sharpen the Mind",
      body: "The most dangerous man in any room is the one who reads. Knowledge compounds silently — and one day, everyone notices.",
      accent: null,
    },
    {
      emoji: "🧠",
      title: "Learn Something Real",
      body: "Five tracks. Twenty-five articles. Philosophy, money, science, history, and strategy. Each one is designed to make you sharper than you were yesterday.",
      accent: null,
    },
    {
      emoji: "📝",
      title: "Read. Think. Prove It.",
      body: "Each article takes about 10 minutes. Read it carefully — at the end, you'll answer three questions to prove you understood what you read.",
      accent: "No skimming. No shortcuts.",
    },
  ];

  const isLastSlide = prepSlide === slides.length - 1;

  if (step === "prep") {
    const slide = slides[prepSlide];
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
          <button onClick={() => {
            if (prepSlide > 0) setPrepSlide(prepSlide - 1);
            else onBack(false);
          }} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 16, padding: 0,
          }}>← Back</button>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setPrepSlide(i)} style={{
                width: i === prepSlide ? 24 : 8, height: 8, borderRadius: 4,
                background: i === prepSlide ? C.gold : C.surfaceLight,
                transition: "all 0.3s ease", cursor: "pointer",
              }} />
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeIn 0.25s ease" }} key={prepSlide}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{slide.emoji}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 6 }}>{slide.title}</div>
              {prepSlide === 0 && (
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>The Ritual</div>
              )}
            </div>
            <div style={{ padding: "20px", borderRadius: 14, background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(8px)" }}>
              <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>{slide.body}</p>
              {slide.accent && (
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontStyle: "italic", fontWeight: 600, marginTop: 14 }}>{slide.accent}</p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            {isLastSlide ? (
              <button onClick={() => setStep("topics")} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: "#22c55e", color: "#000",
              }}>Choose a Topic</button>
            ) : (
              <button onClick={() => setPrepSlide(prepSlide + 1)} style={btnPrimary}>Next</button>
            )}
            <button onClick={() => setShowWhy(true)} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: "#ef4444", color: "#000",
            }}>Not Now</button>
          </div>

          {showWhy && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.85)", display: "flex",
              alignItems: "center", justifyContent: "center",
              animation: "fadeIn 0.3s ease", padding: 24, overflowY: "auto",
            }}>
              <div onClick={e => e.stopPropagation()} style={{
                width: "100%", maxWidth: 360, padding: 28, borderRadius: 20,
                background: C.surface, border: `1px solid ${C.border}`,
                maxHeight: "85vh", overflowY: "auto",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
                  <div style={{
                    width: 110, height: 110, borderRadius: "50%", overflow: "hidden",
                    border: `3px solid ${C.gold}44`,
                    background: "radial-gradient(circle, #1a1a2e 60%, #000 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 20px rgba(0,0,0,0.6)`, marginBottom: 12,
                  }}>
                    <img src="/Descartes.png" alt="Descartes" style={{
                      width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated",
                      filter: "brightness(1.1)",
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Face the Resistance</div>
                  <div style={{ padding: "10px 16px", borderRadius: 10, width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>
                      "{info.featuredQuote.text}"
                    </div>
                    <div style={{ fontSize: 11, color: C.gold }}>— {info.featuredQuote.author}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  You can feel it right now — the pull to close this, to scroll something easier, to tell yourself you'll read later. That instinct is not laziness. It's your brain protecting its energy. It's doing what evolution designed it to do: avoid effort.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  But here's what separates people who grow from people who stagnate: the ones who grow override that instinct. They read when they don't feel like it. They learn when it's uncomfortable. They choose ten minutes of focus over ten minutes of nothing.
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 14 }}>
                  The people you admire — the ones who seem sharper, more articulate, more capable — are not smarter than you. They just read more than you. That gap closes one article at a time.
                </p>
                <p style={{ fontSize: 15, color: C.gold, lineHeight: 1.8, fontWeight: 700, marginBottom: 20 }}>
                  Ten minutes. One article. Start.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => { setShowWhy(false); setStep("topics"); }} style={{
                    width: "100%", padding: "16px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 15, fontWeight: 700,
                    background: "#22c55e", color: "#000",
                  }}>You're Right — Let's Go</button>
                  <button onClick={() => { setShowWhy(false); onBack(false); }} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 14, fontWeight: 700,
                    background: "#ef4444", color: "#000",
                  }}>Not Today</button>
                </div>
              </div>
            </div>
          )}
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
          <button onClick={() => setStep("prep")} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 24, padding: 0,
          }}>← Back</button>

          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Choose Your Track</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20 }}>What will you study?</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TOPICS.map(topic => {
              const available = topic.articles.filter(a => a.content);
              const total = topic.articles.length;
              return (
                <div key={topic.id} onClick={() => {
                  if (available.length > 0) {
                    setSelectedTopic(topic);
                    setSelectedArticle(available[0]);
                    setAnswers({});
                    setSubmitted(false);
                    setStep("reading");
                  }
                }} style={{
                  padding: "16px 18px", borderRadius: 14, cursor: available.length > 0 ? "pointer" : "default",
                  background: C.card, border: `1px solid ${C.cardBorder}`,
                  borderLeft: `4px solid ${topic.color}`,
                  opacity: available.length > 0 ? 1 : 0.5,
                  transition: "all 0.2s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 32 }}>{topic.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{topic.name}</div>
                      <div style={{ fontSize: 12, color: topic.color, fontWeight: 600 }}>{topic.subtitle}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                        {available.length > 0
                          ? `${available.length} of ${total} articles available`
                          : "Coming soon"
                        }
                      </div>
                    </div>
                    {available.length > 0 && (
                      <span style={{ fontSize: 18, color: C.textMuted }}>→</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── READING SCREEN ──
  if (step === "reading" && selectedArticle) {
    const paragraphs = selectedArticle.content.trim().split("\n\n");
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div ref={scrollRef} style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => { setSelectedArticle(null); setSelectedTopic(null); setStep("topics"); }} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 16, padding: 0,
          }}>← Back to Topics</button>

          {/* Topic badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>{selectedTopic.emoji}</span>
            <span style={{ fontSize: 11, color: selectedTopic.color, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{selectedTopic.name}</span>
          </div>

          {/* Article header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.gold, lineHeight: 1.3, marginBottom: 6 }}>
              {selectedArticle.title}
            </div>
            <div style={{ fontSize: 14, color: C.textMuted, fontStyle: "italic" }}>
              {selectedArticle.subtitle}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
              ~{Math.ceil(selectedArticle.content.split(/\s+/).length / 200)} min read · {selectedArticle.questions.length} questions at the end
            </div>
          </div>

          {/* Article body */}
          <div style={{
            padding: "20px", borderRadius: 14,
            background: C.card, border: `1px solid ${C.cardBorder}`,
            backdropFilter: "blur(8px)", marginBottom: 24,
          }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{
                fontSize: 15, color: C.text, lineHeight: 1.9,
                marginBottom: i < paragraphs.length - 1 ? 18 : 0,
              }}>{p}</p>
            ))}
          </div>

          {/* Proceed to quiz */}
          <button onClick={() => { setStep("quiz"); window.scrollTo(0, 0); }} style={{
            width: "100%", padding: "16px", borderRadius: 12, border: "none",
            cursor: "pointer", fontSize: 15, fontWeight: 700,
            background: "#22c55e", color: "#000",
          }}>
            I've Read It — Take the Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN ──
  if (step === "quiz" && selectedArticle) {
    const allAnswered = selectedArticle.questions.every((_, i) => answers[i] !== undefined);
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.25s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => { setStep("reading"); setAnswers({}); setSubmitted(false); }} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 24, padding: 0,
          }}>← Back to Article</button>

          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Quiz</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 20 }}>
            {selectedArticle.title}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {selectedArticle.questions.map((q, qIdx) => (
              <div key={qIdx} style={{
                padding: "16px", borderRadius: 14,
                background: C.card, border: `1px solid ${C.cardBorder}`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12, lineHeight: 1.5 }}>
                  {qIdx + 1}. {q.q}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === oIdx;
                    const isCorrect = submitted && oIdx === q.answer;
                    const isWrong = submitted && isSelected && oIdx !== q.answer;
                    let bg = C.surfaceLight;
                    let border = `1px solid ${C.border}`;
                    let textColor = C.text;
                    if (isSelected && !submitted) {
                      bg = `${C.gold}22`;
                      border = `2px solid ${C.gold}`;
                      textColor = C.gold;
                    }
                    if (isCorrect) {
                      bg = "rgba(34, 197, 94, 0.15)";
                      border = "2px solid #22c55e";
                      textColor = "#22c55e";
                    }
                    if (isWrong) {
                      bg = "rgba(239, 68, 68, 0.15)";
                      border = "2px solid #ef4444";
                      textColor = "#ef4444";
                    }
                    return (
                      <div key={oIdx} onClick={() => {
                        if (!submitted) setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                      }} style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: bg, border,
                        cursor: submitted ? "default" : "pointer",
                        transition: "all 0.2s ease",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            border: `2px solid ${isSelected ? C.gold : C.border}`,
                            background: isSelected ? (submitted ? (isCorrect ? "#22c55e" : "#ef4444") : C.gold) : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                          </div>
                          <span style={{ fontSize: 14, color: textColor, lineHeight: 1.4 }}>{opt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            {!submitted ? (
              <button onClick={() => { if (allAnswered) setSubmitted(true); }} disabled={!allAnswered} style={{
                ...btnPrimary,
                opacity: allAnswered ? 1 : 0.4,
                cursor: allAnswered ? "pointer" : "default",
              }}>
                Submit Answers
              </button>
            ) : (
              <button onClick={() => setStep("score")} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                background: "#22c55e", color: "#000",
              }}>
                See Results
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SCORE SCREEN ──
  if (step === "score" && selectedArticle) {
    const score = getScore();
    const total = selectedArticle.questions.length;
    const passed = score >= 2;
    return (
      <div dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "📖" : "📖"}</div>
          <div style={{
            fontSize: 48, color: passed ? C.ritualDone : "#f59e0b", fontWeight: 800,
            fontFamily: "'Cinzel', serif", marginBottom: 8,
          }}>{score}/{total}</div>
          <div style={{
            fontSize: 20, fontWeight: 700, marginBottom: 8,
            color: passed ? C.ritualDone : "#f59e0b",
          }}>{passed ? "Ritual Complete!" : "Almost There"}</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>
            {passed
              ? `You understood "${selectedArticle.title}" — knowledge gained.`
              : `You need at least 2 of 3 correct. Review the article and try again.`
            }
          </div>
          <div style={{
            padding: "12px 20px", borderRadius: 10, display: "inline-block",
            background: C.card, border: `1px solid ${C.cardBorder}`,
            marginBottom: 32,
          }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
              "{quote.text}"
            </span>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>— {quote.author}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {passed ? (
              <button onClick={() => onBack(true)} style={{
                padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${C.ritualDone}, #16a34a)`,
                color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1,
                boxShadow: `0 4px 20px ${C.ritualDone}44`,
              }}>
                Claim +10 XP
              </button>
            ) : (
              <>
                <button onClick={() => { setStep("reading"); setAnswers({}); setSubmitted(false); window.scrollTo(0, 0); }} style={{
                  padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                  color: "#000", fontSize: 15, fontWeight: 700,
                }}>
                  Re-read the Article
                </button>
                <button onClick={() => { setAnswers({}); setSubmitted(false); setStep("quiz"); window.scrollTo(0, 0); }} style={{
                  padding: "14px 48px", borderRadius: 12, border: `1px solid ${C.border}`,
                  cursor: "pointer", background: "transparent",
                  color: C.textMuted, fontSize: 14, fontWeight: 600,
                }}>
                  Retry Quiz
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
