import { useState } from 'react';
import { C, INTERVIEW_QUESTIONS } from '../constants';
import { assignClassFromPersonality, calcStartingLevel } from '../gameLogic';

export default function InterviewScreen({ onComplete }) {
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedValue, setSelectedValue] = useState(null);

  const q = INTERVIEW_QUESTIONS[qi];
  const totalQuestions = INTERVIEW_QUESTIONS.length;

  const handleSelect = (value) => {
    setSelectedValue(value);
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (qi < totalQuestions - 1) {
        setQi(qi + 1);
        setSelectedValue(null);
      } else {
        // Done — calculate class and level from unified answers
        const cls = assignClassFromPersonality(newAnswers);
        const level = calcStartingLevel(newAnswers);
        onComplete(cls, level);
      }
    }, 400);
  };

  const handleBack = () => {
    if (qi > 0) {
      const prevQ = INTERVIEW_QUESTIONS[qi - 1];
      setQi(qi - 1);
      setSelectedValue(answers[prevQ.id] ?? null);
    }
  };

  // Determine phase label based on question type
  const phaseLabel = q.type === "personality" ? "Who Are You?"
    : q.type === "habit" ? "Your Habits"
    : "One Last Question";
  const phaseColor = q.type === "personality" ? C.tabAvatar
    : q.type === "habit" ? C.ritualDone
    : C.gold;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      {/* Back button */}
      {qi > 0 && (
        <button onClick={handleBack} style={{
          position: "absolute", top: 24, left: 24,
          background: "none", border: "none", color: C.textMuted, fontSize: 14,
          cursor: "pointer", padding: 0,
        }}>← Back</button>
      )}

      {/* Phase label + progress */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{
          fontSize: 11, color: phaseColor,
          fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
        }}>
          {phaseLabel}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>
          {qi + 1} of {totalQuestions}
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            width: `${((qi + 1) / totalQuestions) * 100}%`, height: "100%", borderRadius: 2,
            background: `linear-gradient(90deg, ${C.tabAvatar}, ${C.ritualDone})`,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Question */}
      <div key={qi} style={{ marginTop: 32, animation: "fadeIn 0.3s ease" }}>
        <h3 style={{
          fontSize: 18, fontWeight: 500, marginBottom: 24, textAlign: "center", lineHeight: 1.5,
          color: C.text,
        }}>
          {q.text}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const val = opt.value;
            const isSelected = selectedValue === val || answers[q.id] === val;
            return (
              <button
                key={i}
                onClick={() => handleSelect(val)}
                style={{
                  padding: "16px 20px", borderRadius: 12, textAlign: "left",
                  background: isSelected ? phaseColor + "22" : C.surface,
                  border: `1px solid ${isSelected ? phaseColor : C.border}`,
                  color: C.text, cursor: "pointer", fontSize: 15, transition: "all 0.2s",
                  opacity: 0, animation: `fadeIn 0.3s ease ${i * 0.05}s forwards`,
                }}
              >
                <div style={{ fontWeight: 500 }}>{opt.label}</div>
                {opt.desc && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{opt.desc}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}