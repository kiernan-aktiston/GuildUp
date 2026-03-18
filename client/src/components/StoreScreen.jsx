import { C } from '../constants';

export default function StoreScreen({ playerGold = 247 }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      position: "relative", animation: "fadeIn 0.3s ease",
      padding: "0 0 120px",
    }}>
      {/* Store background */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/store-bg.png)",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.3, pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top: Marketplace info — takes up to midpoint */}
        <div style={{
          flex: "0 0 42vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "0 32px",
        }}>
          <div style={{
            fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 3,
            textTransform: "uppercase", marginBottom: 8,
          }}>MARKETPLACE</div>

          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: 28, color: C.text,
            textAlign: "center", marginBottom: 12,
          }}>Coming Soon</h2>

          <p style={{
            color: C.textMuted, fontSize: 14, textAlign: "center", lineHeight: 1.6,
            maxWidth: 300,
          }}>
            Spend your hard-earned gold on spells, gear, cosmetics, and special items to power up your character and stand out in battle.
          </p>
        </div>

        {/* Middle: Construction banner at ~50% */}
        <div style={{
          flex: "0 0 auto", display: "flex", justifyContent: "center",
          padding: "0",
        }}>
          <div style={{
            padding: "8px", borderRadius: 14,
            background: `repeating-linear-gradient(
              -45deg,
              #f59e0b, #f59e0b 10px,
              #000 10px, #000 20px
            )`,
            width: "100%", maxWidth: 430,
          }}>
            <div style={{
              background: "#f59e0b", padding: "14px 24px", borderRadius: 8,
              fontSize: 15, color: "#000", fontWeight: 900, letterSpacing: 2,
              textTransform: "uppercase", textAlign: "center",
              border: "3px solid #000",
            }}>
              Currently in Development
            </div>
          </div>
        </div>

        {/* Gold saved below banner */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, marginTop: 24,
        }}>
          <span style={{ fontSize: 32 }}>🪙</span>
          <span style={{
            color: C.gold, fontWeight: 800, fontSize: 36, fontFamily: "'Cinzel', serif",
            textShadow: `0 0 20px ${C.gold}33`,
          }}>{playerGold}</span>
          <span style={{
            color: C.gold, fontSize: 13, fontWeight: 600, letterSpacing: 1,
            textTransform: "uppercase",
          }}>Gold Saved</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
