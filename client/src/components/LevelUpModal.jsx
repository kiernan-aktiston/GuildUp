import { C, CLASSES } from '../constants';

export default function LevelUpModal({ level, oldClass, newClass, distribution, onClose }) {
  const cls = CLASSES[newClass] || CLASSES.warrior;
  const classChanged = oldClass !== newClass;
  const statNames = { str: "Strength", agi: "Agility", int: "Intelligence", spi: "Spirit", cha: "Charisma" };
  const statColors = { str: "#ef4444", agi: "#22c55e", int: "#3b82f6", spi: "#a855f7", cha: "#f59e0b" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", display: "flex",
      alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        width: "90%", maxWidth: 360, padding: 32, borderRadius: 20, textAlign: "center",
        background: `radial-gradient(circle at 50% 30%, ${cls.color}15 0%, ${C.surface} 60%)`,
        border: `1px solid ${cls.color}44`,
        boxShadow: `0 0 60px ${cls.color}22`,
      }}>
        <div style={{ fontSize: 56, marginBottom: 12, filter: `drop-shadow(0 0 20px ${cls.color}66)` }}>
          {cls.emoji}
        </div>
        <div style={{ fontSize: 12, color: C.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
          LEVEL UP!
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 36, fontWeight: 800, color: C.gold, marginBottom: 8 }}>
          Level {level}
        </div>

        {classChanged && (
          <div style={{
            padding: "8px 16px", borderRadius: 8, marginBottom: 16,
            background: `${cls.color}22`, border: `1px solid ${cls.color}44`,
          }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>CLASS EVOLVED</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: cls.color }}>
              {CLASSES[oldClass]?.title} → {cls.title}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1, marginBottom: 10 }}>STAT GAINS</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {Object.entries(distribution).filter(([_, v]) => v > 0).map(([stat, val]) => (
              <div key={stat} style={{
                padding: "6px 14px", borderRadius: 8,
                background: `${statColors[stat]}18`, border: `1px solid ${statColors[stat]}33`,
              }}>
                <span style={{ color: statColors[stat], fontWeight: 700, fontSize: 14 }}>+{val}</span>
                <span style={{ color: C.textMuted, fontSize: 12, marginLeft: 4 }}>{statNames[stat]}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 15, fontWeight: 700,
        }}>
          Continue
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
