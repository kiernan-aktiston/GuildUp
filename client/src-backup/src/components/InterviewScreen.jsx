import { useState } from 'react';
import { C, PERSONALITY_QUESTIONS, HABIT_QUESTIONS } from '../constants';
import { assignClassFromPersonality, calcStartingLevel } from '../gameLogic';

export default function InterviewScreen({ onComplete }) {
  const [phase, setPhase] = useState("personality"); // personality → habits
  const [qi, setQi] = useState(0);
  const [personalityAnswers, setPersonalityAnswers] = useState({});
  const [habitAnswers, setHabitAnswers] = useState({});

  const questions = phase === "personality" ? PERSONALITY_QUESTIONS : HABIT_QUESTIONS;
  const q = questions[qi];
  const answers = phase === "personality" ? personalityAnswers : habitAnswers;
  const totalQuestions = PERSONALITY_QUESTIONS.length + HABIT_QUESTIONS.length;
  const currentTotal = phase === "personality" ? qi + 1 : PERSONALITY_QUESTIONS.length + qi + 1;

  const handleAnswer = (value) => {
    if (phase === "personality") {
      const newAnswers = { ...personalityAnswers, [q.id]: value };
      setPersonalityAnswers(newAnswers);
      if (qi < PERSONALITY_QUESTIONS.length - 1) {
        setTimeout(() => setQi(qi + 1), 300);
      } else {
        // Move to habits
        setTimeout(() => { setPhase("habits"); setQi(0); }, 500);
      }
    } else {
      const newAnswers = { ...habitAnswers, [q.id]: value };
      setHabitAnswers(newAnswers);
      if (qi < HABIT_QUESTIONS.length - 1) {
        setTimeout(() => setQi(qi + 1), 300);
      } else {
        // Done — calculate class and level
        const cls = assignClassFromPersonality(personalityAnswers);
        const level = calcStartingLevel(newAnswers);
        setTimeout(() => onComplete(cls, level, personalityAnswers, newAnswers), 500);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      {/* Phase label */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{
          fontSize: 11, color: phase === "personality" ? C.tabAvatar : C.ritualDone,
          fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
        }}>
          {phase === "personality" ? "Who Are You?" : "What Are Your Habits?"}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{currentTotal} of {totalQuestions}</div>
        {/* Progress bar */}
        <div style={{ height: 4, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            width: `${(currentTotal / totalQuestions) * 100}%`, height: "100%", borderRadius: 2,
            background: `linear-gradient(90deg, ${C.tabAvatar}, ${C.ritualDone})`,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      <div key={`${phase}-${qi}`} style={{ marginTop: 32, animation: "fadeIn 0.3s ease" }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 24, textAlign: "center", lineHeight: 1.5 }}>
          {q.text}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const val = phase === "personality" ? opt.value : opt.value;
            const isSelected = answers[q.id] === val;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(val)}
                style={{
                  padding: "16px 20px", borderRadius: 12, textAlign: "left",
                  background: isSelected ? C.tabAvatar + "22" : C.surface,
                  border: `1px solid ${isSelected ? C.tabAvatar : C.border}`,
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

// ============================================
// CLASS REVEAL (with starting level)
// ============================================
