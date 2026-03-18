import { C } from '../constants';

export default function LandingScreen({ onSignUp, onSignIn }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", padding: 32,
      background: `radial-gradient(ellipse at 50% 30%, ${C.gold}08 0%, transparent 60%), ${C.bg}`,
    }}>
      <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
        <div style={{ fontSize: 56, marginBottom: 12, filter: `drop-shadow(0 0 20px ${C.gold}44)` }}>⚔️</div>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 36, color: C.gold,
          letterSpacing: 3, marginBottom: 6,
        }}>GUILDUP</h1>
        <p style={{
          color: C.textMuted, fontSize: 15, letterSpacing: 0.5, marginBottom: 48,
        }}>Forge yourself. Find your guild.</p>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", gap: 12,
        width: "100%", maxWidth: 300, animation: "fadeIn 1s ease",
      }}>
        <button onClick={onSignUp} style={{
          width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 16, fontWeight: 700, letterSpacing: 0.5,
        }}>
          Sign Up
        </button>
        <button onClick={onSignIn} style={{
          width: "100%", padding: "16px", borderRadius: 12, cursor: "pointer",
          background: C.surfaceLight, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 16, fontWeight: 500,
        }}>
          Sign In
        </button>
      </div>
    </div>
  );
}
