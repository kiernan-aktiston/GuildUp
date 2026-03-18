import { C, CLASSES } from '../constants';
import { getRank } from '../constants';
import { statPointsForLevel } from '../gameLogic';

export default function AvatarScreen({ playerClass = "warrior", playerLevel = 1, playerStats = {}, playerGold = 0, playerName = "Adventurer", onSignOut, avatarUrl, onAvatarUpload }) {
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
        {/* Profile Photo — black border */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
          <div style={{
            width: 162, height: 162, borderRadius: 24, overflow: "hidden",
            border: `4px solid #000`,
            background: `linear-gradient(135deg, ${C.surfaceLight}, ${C.surface})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 32px #00000066`,
            marginBottom: 16,
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 120, height: 120, borderRadius: 60,
                border: `2px dashed ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 14, color: C.textDim, textAlign: "center", lineHeight: 1.3 }}>Tap to<br/>Upload</span>
              </div>
            )}
          </div>

          {/* Username */}
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            {playerName}
          </div>

          {/* Rank and Level */}
          <div style={{ fontSize: 13, color: C.gold, fontWeight: 600, letterSpacing: 1.5, marginBottom: 12 }}>
            {rank.toUpperCase()} — LEVEL {playerLevel}
          </div>

          {/* Class icon */}
          <div style={{
            fontSize: 48, marginBottom: 6,
            filter: `drop-shadow(0 0 12px ${cls.color}44)`,
          }}>
            {cls.emoji}
          </div>

          {/* Class name */}
          <div style={{ fontSize: 16, color: cls.color, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
            {cls.title}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
            {cls.desc}
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
          padding: "12px 16px", borderRadius: 10, marginBottom: 24, textAlign: "center",
          background: C.card, border: `1px solid ${C.cardBorder}`,
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Next level up: </span>
          <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>+{statPointsForLevel(playerLevel + 1)} stat points</span>
        </div>

        {/* Three action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => document.getElementById("avatar-upload")?.click()} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "rgba(59, 130, 246, 0.85)",
            color: "#fff", fontSize: 15, fontWeight: 700,
          }}>
            Edit Avatar
          </button>
          <button style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "default",
            background: "rgba(245, 158, 11, 0.85)",
            color: "#000", fontSize: 15, fontWeight: 700,
          }}>
            Inventory (Coming Soon)
          </button>
          {onSignOut && (
