import { C } from '../constants';

export default function XPBar({ xp = 340, maxXp = 500, level = 4 }) {
  const pct = (xp / maxXp) * 100;
  return (
    <div style={{
      position: "fixed", bottom: 58, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, padding: "0 16px 8px",
      background: "transparent",
      zIndex: 99,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: C.textMuted }}>Level {level}</span>
        <span style={{ fontSize: 10, color: C.textMuted }}>{xp}/{maxXp} XP</span>
      </div>
      <div style={{ height: 6, background: C.surfaceLight, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 3,
          background: `linear-gradient(90deg, ${C.xp}, #a78bfa)`,
        }} />
      </div>
    </div>
  );
}
