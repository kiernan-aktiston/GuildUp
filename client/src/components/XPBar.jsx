import { C } from '../constants';

export default function XPBar({ xp = 340, maxXp = 500, level = 4 }) {
  const pct = (xp / maxXp) * 100;
  return (
    <div style={{
      position: "fixed", bottom: 58, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, padding: "0 18px 6px",
      background: C.bg, zIndex: 99,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: C.textDim, fontWeight: 500 }}>Lv {level}</span>
        <span style={{ fontSize: 10, color: C.textDim, fontFamily: "monospace" }}>{xp}/{maxXp}</span>
      </div>
      <div style={{ height: 3, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 2,
          background: `linear-gradient(90deg, ${C.goldDark}, ${C.gold})`,
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  );
}