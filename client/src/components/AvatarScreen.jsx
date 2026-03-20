import { useState } from 'react';
import { C, CLASSES, getRank } from '../constants';
import { statPointsForLevel } from '../gameLogic';

const SUB_TABS = [
  { key: "avatar", label: "Avatar", emoji: "⚔️" },
  { key: "inventory", label: "Inventory", emoji: "🎒" },
  { key: "spells", label: "Spells", emoji: "✨" },
];

export default function AvatarScreen({ playerClass = "warrior", playerLevel = 1, playerStats = {}, playerGold = 0, playerName = "Adventurer", onSignOut, avatarUrl, onAvatarUpload }) {
  const [subTab, setSubTab] = useState("avatar");
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const maxStat = Math.max(playerStats.str || 10, playerStats.agi || 10, playerStats.int || 10, playerStats.spi || 10, playerStats.cha || 10, 1);
  const stats = [
    { label: "Strength", value: playerStats.str || 10, pct: ((playerStats.str || 10) / maxStat) * 100, color: "#ef4444" },
    { label: "Agility", value: playerStats.agi || 10, pct: ((playerStats.agi || 10) / maxStat) * 100, color: "#22c55e" },
    { label: "Intelligence", value: playerStats.int || 10, pct: ((playerStats.int || 10) / maxStat) * 100, color: "#3b82f6" },
    { label: "Spirit", value: playerStats.spi || 10, pct: ((playerStats.spi || 10) / maxStat) * 100, color: "#a855f7" },
    { label: "Charisma", value: playerStats.cha || 10, pct: ((playerStats.cha || 10) / maxStat) * 100, color: "#f59e0b" },
  ];

  return (
    <div style={{
      padding: "24px 16px 120px",
      minHeight: "100vh", animation: "fadeIn 0.3s ease",
      position: "relative",
    }}>
      {/* Background image */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/avatar-bg.png)",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.2, pointerEvents: "none", zIndex: 0,
      }} />

      {/* Hidden file input */}
      <input
        id="avatar-upload" type="file" accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onAvatarUpload) onAvatarUpload(file);
          e.target.value = "";
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Profile header — always visible */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
          <div style={{
            width: 132, height: 132, borderRadius: 20, overflow: "hidden",
            border: "4px solid #000",
            background: `linear-gradient(135deg, ${C.surfaceLight}, ${C.surface})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px #00000066",
            marginBottom: 12,
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 90, height: 90, borderRadius: 45,
                border: `2px dashed ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 12, color: C.textDim, textAlign: "center", lineHeight: 1.3 }}>Tap to<br/>Upload</span>
              </div>
            )}
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 2 }}>
            {playerName}
          </div>
          <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, letterSpacing: 1.5, marginBottom: 8 }}>
            {rank.toUpperCase()} — LEVEL {playerLevel}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 32, filter: `drop-shadow(0 0 8px ${cls.color}44)` }}>{cls.emoji}</span>
            <div>
              <div style={{ fontSize: 14, color: cls.color, fontWeight: 700 }}>{cls.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>{cls.desc}</div>
            </div>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 16,
          background: C.surfaceLight, borderRadius: 12, padding: 4,
        }}>
          {SUB_TABS.map(t => {
            const active = subTab === t.key;
            return (
              <button key={t.key} onClick={() => setSubTab(t.key)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
                background: active ? C.card : "transparent",
                color: active ? C.gold : C.textMuted,
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>
                <span style={{ fontSize: 14 }}>{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── AVATAR TAB ── */}
        {subTab === "avatar" && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            {/* Gear — Coming Soon */}
            <div style={{
              padding: "16px", borderRadius: 12, marginBottom: 12,
              background: C.card, border: `1px solid ${C.cardBorder}`,
              backdropFilter: "blur(8px)",
            }}>
              <div style={{
                fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 1.5,
                textTransform: "uppercase", marginBottom: 10, fontFamily: "'Cinzel', serif",
              }}>Gear</div>
              <div style={{
                display: "flex", justifyContent: "center", gap: 12, padding: "12px 0",
              }}>
                {["🗡️", "🛡️", "⚔️", "🪖", "🥾"].map((g, i) => (
                  <div key={i} style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: C.surfaceLight, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0.4,
                  }}>
                    <span style={{ fontSize: 20 }}>{g}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", fontSize: 11, color: C.textDim, fontStyle: "italic" }}>
                Gear drops from quest chests — coming soon
              </div>
            </div>

            {/* Character Traits */}
            <div style={{
              padding: "16px", borderRadius: 12, marginBottom: 12,
              background: C.card, border: `1px solid ${C.cardBorder}`,
              backdropFilter: "blur(8px)",
            }}>
              <div style={{
                fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 1.5,
                textTransform: "uppercase", marginBottom: 14, fontFamily: "'Cinzel', serif",
              }}>Character Traits</div>
              {stats.map((s, i) => (
                <div key={i} style={{ marginBottom: i < 4 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.value}</span>
                  </div>
                  <div style={{ height: 6, background: C.surfaceLight, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${s.pct}%`, height: "100%", borderRadius: 3,
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`,
                      transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Stat Points Info */}
            <div style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 16, textAlign: "center",
              background: C.card, border: `1px solid ${C.cardBorder}`,
              backdropFilter: "blur(8px)",
            }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>Next level up: </span>
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>+{statPointsForLevel(playerLevel + 1)} stat points</span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => document.getElementById("avatar-upload")?.click()} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "rgba(59, 130, 246, 0.85)",
                color: "#fff", fontSize: 15, fontWeight: 700,
              }}>
                Edit Avatar
              </button>
              {onSignOut && (
                <button onClick={onSignOut} style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "rgba(239, 68, 68, 0.85)",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                }}>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── INVENTORY TAB ── */}
        {subTab === "inventory" && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{
              padding: "32px 20px", borderRadius: 14, textAlign: "center",
              background: C.card, border: `1px solid ${C.cardBorder}`,
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎒</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 18, color: C.gold,
                fontWeight: 700, marginBottom: 8,
              }}>Inventory</div>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
                Potions, scrolls, and consumables you collect from quest chests and the marketplace.
              </p>
              <div style={{
                display: "flex", justifyContent: "center", gap: 10, marginBottom: 16,
              }}>
                {["🧪", "📜", "💎", "🔑"].map((item, i) => (
                  <div key={i} style={{
                    width: 50, height: 50, borderRadius: 12,
                    background: C.surfaceLight, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0.3,
                  }}>
                    <span style={{ fontSize: 24 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{
                padding: "10px 16px", borderRadius: 8,
                background: `repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px)`,
                display: "inline-block",
              }}>
                <div style={{
                  background: "#f59e0b", padding: "8px 20px", borderRadius: 4,
                  fontSize: 12, color: "#000", fontWeight: 900, letterSpacing: 2,
                  textTransform: "uppercase", border: "2px solid #000",
                }}>Coming Soon</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SPELLS TAB ── */}
        {subTab === "spells" && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{
              padding: "32px 20px", borderRadius: 14, textAlign: "center",
              background: C.card, border: `1px solid ${C.cardBorder}`,
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 18, color: C.gold,
                fontWeight: 700, marginBottom: 8,
              }}>Spells & Abilities</div>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
                Unlock powerful abilities tied to your class. Cast spells in battle, buff your guild, and unleash your potential.
              </p>
              <div style={{
                display: "flex", justifyContent: "center", gap: 10, marginBottom: 16,
              }}>
                {["🔥", "❄️", "⚡", "🌿"].map((spell, i) => (
                  <div key={i} style={{
                    width: 50, height: 50, borderRadius: 12,
                    background: C.surfaceLight, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0.3,
                  }}>
                    <span style={{ fontSize: 24 }}>{spell}</span>
                  </div>
                ))}
              </div>
              <div style={{
                padding: "10px 16px", borderRadius: 8,
                background: `repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px)`,
                display: "inline-block",
              }}>
                <div style={{
                  background: "#f59e0b", padding: "8px 20px", borderRadius: 4,
                  fontSize: 12, color: "#000", fontWeight: 900, letterSpacing: 2,
                  textTransform: "uppercase", border: "2px solid #000",
                }}>Coming Soon</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}