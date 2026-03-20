import { useState } from 'react';
import { C } from '../constants';

export default function WelcomeSlides({ onComplete }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { emoji: "⚔️", title: "This Isn't Another Habit App", text: "Most apps tell you what to do. GuildUp makes you want to do it. Five daily rituals. Real effort. Real XP. A character that evolves with you." },
    { emoji: "🔥", title: "Train. Read. Connect. Be Still. Move.", text: "Every day you complete real-world quests that build five dimensions of your character — strength, intelligence, spirit, charisma, and agility. Every action counts." },
    { emoji: "🏰", title: "Your Class. Your Guild. Your Legacy.", text: "Discover your starting class. Level up through discipline. Join a guild with friends and hold each other accountable. The game is your life — play it well." },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32 }}>
      <div key={slide} style={{ textAlign: "center", animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>{slides[slide].emoji}</div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.gold, marginBottom: 12, letterSpacing: 1 }}>
          {slides[slide].title}
        </h2>
        <p style={{ color: C.textMuted, lineHeight: 1.7, fontSize: 15, marginBottom: 40 }}>
          {slides[slide].text}
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
            background: i === slide ? C.gold : C.border, transition: "all 0.3s",
          }} />
        ))}
      </div>
      <button onClick={() => slide < slides.length - 1 ? setSlide(slide + 1) : onComplete()} style={{
        width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
        color: "#000", fontSize: 16, fontWeight: 700,
      }}>
        {slide < slides.length - 1 ? "Next" : "Begin Your Journey"}
      </button>
    </div>
  );
}

// ============================================
// INTERVIEW — PERSONALITY (determines class)
// ============================================