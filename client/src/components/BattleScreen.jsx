import { C } from '../constants';

export default function BattleScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      position: "relative", animation: "fadeIn 0.3s ease",
      padding: "0 0 120px",
    }}>
      {/* Arena background */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/arena-bg.png)",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.3, pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top: Arena info — takes up to midpoint */}
        <div style={{
          flex: "0 0 42vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "0 32px",
        }}>
          <div style={{
            fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 3,
            textTransform: "uppercase", marginBottom: 8,
          }}>ARENA</div>

          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: 28, color: C.text,
            textAlign: "center", marginBottom: 12,
          }}>Coming Soon</h2>

          <p style={{
            color: C.textMuted, fontSize: 14, textAlign: "center", lineHeight: 1.6,
            maxWidth: 300,
          }}>
            Challenge your friends to battle. Your real-world effort is your power — every quest makes you stronger. Gear up. Cast spells. Strike hard. Victory favors the devoted.
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

        {/* VS preview below banner */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          marginTop: 24,
        }}>
          <div style={{
            width: 280, height: 160, borderRadius: 16,
            background: C.card, border: `1px solid ${C.cardBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              position: "absolute", left: 40, bottom: 40,
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{
                fontSize: 48, filter: "drop-shadow(0 0 8px #ef444444)",
                animation: "float 2s ease-in-out infinite",
              }}>⚔️</div>
              <div style={{
                fontSize: 9, color: C.text, background: `${C.tabBattle}aa`, padding: "2px 6px",
                borderRadius: 4, marginTop: 4, fontWeight: 600,
              }}>LV.8 WARRIOR</div>
            </div>
            <div style={{
              fontSize: 20, fontWeight: 900, color: C.gold, fontFamily: "'Cinzel', serif",
              textShadow: `0 0 20px ${C.gold}44`, letterSpacing: 2,
            }}>VS</div>
            <div style={{
              position: "absolute", right: 40, bottom: 40,
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{
                fontSize: 48, filter: "drop-shadow(0 0 8px #3b82f644)",
                animation: "float 2s ease-in-out infinite 0.5s",
              }}>📖</div>
              <div style={{
                fontSize: 9, color: C.text, background: `${C.tabStore}aa`, padding: "2px 6px",
                borderRadius: 4, marginTop: 4, fontWeight: 600,
              }}>LV.9 SAGE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STORE SCREEN (placeholder)
// ============================================
