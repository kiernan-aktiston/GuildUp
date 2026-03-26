import { C } from '../constants';

export default function BattleScreen() {
  return (
    <div style={{ padding: "16px 18px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease", position: "relative" }}>
      {/* Faint nebula glow */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139, 48, 48, 0.04) 0%, transparent 70%)",
      }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.6 }}>{"\u2694\uFE0F"}</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: 2, marginBottom: 8 }}>The Arena</div>
        <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 4 }}>Coming Soon</div>
        <div style={{ fontSize: 13, color: C.textDim, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>Deploy your champion. Test your build against others. Prove you belong.</div>
      </div>
    </div>
  );
}