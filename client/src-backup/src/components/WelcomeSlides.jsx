import { useState } from 'react';
import { C } from '../constants';

export default function WelcomeSlides({ onComplete }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { emoji: "⚔️", title: "Welcome, Adventurer", text: "GuildUp transforms your daily habits into an RPG journey. Complete quests. Level up. Become legendary." },
    { emoji: "🏋️", title: "The Five", text: "Five daily rituals form your foundation. Each one builds a different part of your character — strength, agility, intellect, spirit, and charisma." },
    { emoji: "🔄", title: "Your Class Will Evolve", text: "Your starting class is based on who you are today. But the quests you choose will shape who you become. Your class can shift as your habits change." },
    { emoji: "💪", title: "Every Quest Makes You Stronger", text: "Completing daily quests powers up your avatar. The more you do, the stronger you'll be when you battle your friends." },
    { emoji: "🏰", title: "Find Your Guild", text: "Join or create a guild with friends. Rise together, compete, and hold each other accountable." },
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
