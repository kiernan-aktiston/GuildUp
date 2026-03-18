import { C, CLASSES } from '../constants';
import { getRank } from '../constants';

export default function ClassRevealScreen({ className, startingLevel, onContinue }) {
  const cls = CLASSES[className] || CLASSES.warrior;
  const rank = getRank(startingLevel);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", padding: 32,
      background: `radial-gradient(circle at 50% 40%, ${cls.color}15 0%, transparent 60%), ${C.bg}`,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 80, marginBottom: 16, filter: `drop-shadow(0 0 30px ${cls.color}66)`,
          animation: "fadeIn 0.6s ease",
        }}>
          {cls.emoji}
        </div>
        <div style={{
          fontSize: 13, color: C.textMuted, marginBottom: 8, letterSpacing: 3,
          textTransform: "uppercase", animation: "fadeIn 0.8s ease",
        }}>
          Your class is
        </div>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 36, color: cls.color,
          marginBottom: 8, letterSpacing: 2, animation: "fadeIn 1s ease",
        }}>
          {cls.title}
        </h1>
        <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.6, marginBottom: 16, animation: "fadeIn 1.2s ease" }}>
          {cls.desc}
        </p>

        {/* Starting level + rank */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          padding: "12px 24px", borderRadius: 12,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          animation: "fadeIn 1.4s ease",
        }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.gold, fontFamily: "'Cinzel', serif" }}>
              Level {startingLevel}
            </div>
            <div style={{ fontSize: 12, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {rank}
            </div>
          </div>
        </div>

        <p style={{
          color: C.textDim, fontSize: 13, marginTop: 20, lineHeight: 1.6,
          maxWidth: 280, animation: "fadeIn 1.6s ease",
        }}>
          This is where you start. Complete quests daily to level up and evolve your class.
        </p>
      </div>

      <button onClick={onContinue} style={{
        marginTop: 40, width: "100%", maxWidth: 300, padding: "16px",
        borderRadius: 12, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
        color: "#000", fontSize: 16, fontWeight: 700,
        animation: "fadeIn 1.8s ease",
      }}>
        Enter the Realm
      </button>
    </div>
  );
}

// ============================================
// LEVEL UP MODAL
// ============================================
