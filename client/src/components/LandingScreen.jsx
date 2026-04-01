import { useState, useEffect } from 'react';
import { C } from '../constants';

const MONO = "'Courier New', 'Consolas', monospace";

const MENTORS = [
  { name: "Marcus", role: "Forge Protocol", accent: "#e8922d", portrait: "/marcus-portrait.png", bg: "/forge-canyon.png", quote: "The body is the first instrument. If it fails, nothing else matters." },
  { name: "Kaya", role: "Recon Protocol", accent: "#4eba6f", portrait: "/kaya-portrait.png", bg: "/recon-ridge.png", quote: "An operator who doesn't know the ground is already lost." },
  { name: "Aldric", role: "Intel Protocol", accent: "#5b9bd5", portrait: "/aldric-portrait.png", bg: "/intel-archive.png", quote: "Knowledge is the only weapon that gets sharper with use." },
  { name: "Khalil", role: "Sanctum Protocol", accent: "#9b6dcc", portrait: "/khalil-portrait.png", bg: "/sanctum-cave.png", quote: "Stillness is not weakness. It is the deepest kind of readiness." },
  { name: "Lucien", role: "Signal Protocol", accent: "#dbb85c", portrait: "/lucien-portrait.png", bg: "/signal-chamber.png", quote: "An isolated operator is a dead one. Send the message." },
];

const PROTOCOLS = [
  { code: "FORGE", name: "Forge the Body", desc: "Bodyweight training. 4 progressive tiers. No gym required.", accent: "#e8922d", icon: "/icon-forge.png" },
  { code: "RECON", name: "Explore the Land", desc: "Walk or jog. Map your territory. Build environmental awareness.", accent: "#4eba6f", icon: "/icon-recon.png" },
  { code: "INTEL", name: "Sharpen the Mind", desc: "20 minutes of reading. Curated passages. Comprehension checks.", accent: "#5b9bd5", icon: "/icon-intel.png" },
  { code: "SANCTUM", name: "Still the Spirit", desc: "Prayer, meditation, or stillness. Guided breathing. 10 minutes.", accent: "#9b6dcc", icon: "/icon-sanctum.png" },
  { code: "SIGNAL", name: "Rally Your Allies", desc: "Reach out to someone. Maintain your network. Stay connected.", accent: "#dbb85c", icon: "/icon-signal.png" },
];

export default function LandingScreen({ onSignUp, onSignIn }) {
  const [activeMentor, setActiveMentor] = useState(0);

  // Rotate mentors
  useEffect(() => {
    const iv = setInterval(() => setActiveMentor(prev => (prev + 1) % MENTORS.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const mentor = MENTORS[activeMentor];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, overflowY: "auto", overflowX: "hidden" }}>

      {/* ═══════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════ */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", padding: "60px 28px 40px",
        position: "relative",
      }}>
        {/* Background image — rotating with mentor */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${mentor.bg})`, backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.25, transition: "background-image 1s ease, opacity 1s ease",
        }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "linear-gradient(to bottom, rgba(17,17,20,0.3) 0%, rgba(17,17,20,0.95) 80%, rgba(17,17,20,1) 100%)" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "fadeIn 1s ease", maxWidth: 400 }}>

          <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold, letterSpacing: 4, textTransform: "uppercase", marginBottom: 32, fontWeight: 600 }}>
            The Compact is Hiring
          </div>

          <img src="/guildup-sigil.png" alt="GuildUp" style={{ width: 120, height: 120, objectFit: "contain", marginBottom: 20, opacity: 0.9 }} onError={e => { e.target.style.display = "none"; }} />

          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: 4, marginBottom: 8 }}>
            GUILDUP
          </div>

          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 12, fontWeight: 400 }}>
            Your life is the game.<br />Your habits are the training.
          </div>

          <div style={{ fontFamily: MONO, fontSize: 11, color: C.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 48, fontWeight: 500 }}>
            Become Operational
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300, margin: "0 auto 48px" }}>
            <button onClick={onSignUp} style={{
              width: "100%", padding: "16px", cursor: "pointer",
              background: C.goldFaint, border: `1px solid ${C.gold}`,
              fontFamily: MONO, color: C.gold, fontSize: 14, fontWeight: 700,
              letterSpacing: 2, borderRadius: 0,
            }}>[ APPLY ]</button>
            <button onClick={onSignIn} style={{
              width: "100%", padding: "14px", cursor: "pointer",
              background: "transparent", border: `1px solid ${C.border}`,
              fontFamily: MONO, color: C.textMuted, fontSize: 12,
              letterSpacing: 1, borderRadius: 0,
            }}>[ SIGN IN ]</button>
          </div>

          {/* Scroll indicator */}
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, letterSpacing: 2, animation: "float 2s ease infinite" }}>
            {"\u2193"} SCROLL FOR BRIEFING {"\u2193"}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* WHAT IS GUILDUP */}
      {/* ═══════════════════════════════════════ */}
      <div style={{ padding: "80px 28px", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>
          Briefing
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", lineHeight: 1.6, marginBottom: 20 }}>
          GuildUp is a gamified self-improvement system for men who want structure, accountability, and progression.
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: 32 }}>
          Five daily protocols. Five mentors. One mission: become the strongest, sharpest, most disciplined version of yourself. Every completed ritual earns XP, gold, and equipment. Every day you show up, your character evolves.
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.9 }}>
          This is not a to-do list. This is a quiet, compounding evolution of identity — wrapped in a world that takes your effort seriously.
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* THE FIVE PROTOCOLS */}
      {/* ═══════════════════════════════════════ */}
      <div style={{ padding: "40px 28px 80px", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 24 }}>
          The Protocols
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PROTOCOLS.map((p, i) => (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 12,
              background: `${p.accent}0d`,
              borderLeft: `3px solid ${p.accent}`,
              border: `1px solid ${p.accent}20`,
              borderLeftWidth: 3,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <img src={p.icon} alt={p.code} style={{ width: 28, height: 28, objectFit: "contain", opacity: 0.8 }} onError={e => { e.target.style.display = "none"; }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: p.accent, letterSpacing: 1, fontWeight: 600 }}>{p.code}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{p.name}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, paddingLeft: 40 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* MENTOR SHOWCASE */}
      {/* ═══════════════════════════════════════ */}
      <div style={{ padding: "60px 28px 80px", position: "relative" }}>
        {/* Background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${mentor.bg})`, backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.15, transition: "background-image 1s ease",
        }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: `linear-gradient(to bottom, ${C.bg} 0%, rgba(17,17,20,0.7) 30%, rgba(17,17,20,0.7) 70%, ${C.bg} 100%)` }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 32 }}>
            Your Mentors
          </div>

          {/* Portrait */}
          <div style={{ marginBottom: 20, transition: "all 0.5s ease" }}>
            <img src={mentor.portrait} alt={mentor.name} style={{
              width: 140, height: 140, objectFit: "cover", borderRadius: "50%",
              border: `2px solid ${mentor.accent}55`, transition: "all 0.5s ease",
            }} onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: mentor.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{mentor.role}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: 2, marginBottom: 16 }}>{mentor.name}</div>

          <div style={{
            background: "rgba(0,0,0,0.5)", padding: "18px 22px", borderRadius: 12,
            border: `1px solid ${mentor.accent}33`, marginBottom: 24, transition: "border-color 0.5s ease",
          }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontStyle: "italic", lineHeight: 1.8 }}>
              "{mentor.quote}"
            </div>
          </div>

          {/* Mentor dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {MENTORS.map((m, i) => (
              <div key={i} onClick={() => setActiveMentor(i)} style={{
                width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                background: i === activeMentor ? m.accent : C.surfaceLight,
                transition: "background 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* FEATURES */}
      {/* ═══════════════════════════════════════ */}
      <div style={{ padding: "60px 28px 80px", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 24 }}>
          Systems
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { title: "XP & Leveling", desc: "Every ritual earns XP. Level up. Watch your stats grow.", accent: C.gold },
            { title: "Equipment", desc: "Earn gold. Buy gear. Equip items that boost your stats.", accent: "#e8922d" },
            { title: "Guilds", desc: "Form a 5-person squad. Hold each other accountable.", accent: "#4eba6f" },
            { title: "Contracts", desc: "Deploy guildmates on missions. Higher stats, better odds.", accent: "#5b9bd5" },
            { title: "Class System", desc: "Your habits determine your class. 11 unique paths.", accent: "#9b6dcc" },
            { title: "Weekly Quests", desc: "Hit weekly targets. Claim reward chests.", accent: "#dbb85c" },
          ].map((f, i) => (
            <div key={i} style={{
              padding: "16px", borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: f.accent, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ═══════════════════════════════════════ */}
      <div style={{ padding: "60px 28px 100px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "url(/ops-bg.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.1 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 400, margin: "0 auto" }}>
          <img src="/guildup-sigil.png" alt="" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 20, opacity: 0.6 }} />

          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: 2, marginBottom: 12 }}>
            Ready to Begin?
          </div>

          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 8 }}>
            The Compact doesn't recruit everyone.<br />But if you're reading this, you're already being assessed.
          </div>

          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 28, fontWeight: 700, color: C.gold, marginBottom: 4, marginTop: 24 }}>
            $5.99/mo
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 32 }}>
            cancel anytime
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300, margin: "0 auto" }}>
            <button onClick={onSignUp} style={{
              width: "100%", padding: "16px", cursor: "pointer",
              background: C.goldFaint, border: `1px solid ${C.gold}`,
              fontFamily: MONO, color: C.gold, fontSize: 14, fontWeight: 700,
              letterSpacing: 2, borderRadius: 0,
            }}>[ APPLY NOW ]</button>
            <button onClick={onSignIn} style={{
              width: "100%", padding: "14px", cursor: "pointer",
              background: "transparent", border: `1px solid ${C.border}`,
              fontFamily: MONO, color: C.textMuted, fontSize: 12,
              letterSpacing: 1, borderRadius: 0,
            }}>[ SIGN IN ]</button>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 40, lineHeight: 2 }}>
            GuildUp {"\u00B7"} Built by Aktiston LLC
          </div>
        </div>
      </div>
    </div>
  );
}