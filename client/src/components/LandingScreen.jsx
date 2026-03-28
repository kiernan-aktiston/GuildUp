import { C } from '../constants';

const MONO = "'Courier New', 'Consolas', monospace";

export default function LandingScreen({ onSignUp, onSignIn }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", padding: "40px 28px",
      background: "#050505", position: "relative",
    }}>
      {/* Faint hex grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "url(/ops-bg.png)", backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.3,
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "fadeIn 0.8s ease" }}>

        {/* The Compact tagline — small, up top */}
        <div style={{
          fontFamily: MONO, fontSize: 10, color: C.textDim, letterSpacing: 3,
          textTransform: "uppercase", marginBottom: 40,
        }}>The Compact is Hiring</div>

        {/* GuildUp Sigil */}
        <div style={{ marginBottom: 24 }}>
          <img src="/guildup-sigil.png" alt="GuildUp" style={{
            width: 140, height: 140, objectFit: "contain",
          }} onError={e => { e.target.style.display = "none"; }} />
        </div>

        {/* GuildUp wordmark */}
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 32, fontWeight: 700,
          color: C.gold, letterSpacing: 6, marginBottom: 12,
        }}>GUILDUP</div>

        {/* Tagline */}
        <div style={{
          fontFamily: MONO, fontSize: 12, color: C.textMuted, letterSpacing: 2,
          textTransform: "uppercase", marginBottom: 64,
        }}>Become Operational</div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
          <button onClick={onSignUp} style={{
            width: "100%", padding: "16px", cursor: "pointer",
            background: "transparent", border: `1px solid ${C.gold}55`,
            fontFamily: MONO, color: C.gold, fontSize: 14, fontWeight: 600,
            letterSpacing: 2, borderRadius: 0,
          }}>[ APPLY ]</button>
          <button onClick={onSignIn} style={{
            width: "100%", padding: "14px", cursor: "pointer",
            background: "transparent", border: `1px solid ${C.border}`,
            fontFamily: MONO, color: C.textDim, fontSize: 13,
            letterSpacing: 1, borderRadius: 0,
          }}>[ SIGN IN ]</button>
        </div>
      </div>
    </div>
  );
}