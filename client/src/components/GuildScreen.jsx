mport { useState } from 'react';
import { C, CLASSES } from '../constants';

export default function GuildScreen({ userId, userGuild, guildMembers = [], onCreateGuild, onJoinByCode }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildDesc, setGuildDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
    background: C.surfaceLight, border: `1px solid ${C.border}`,
    color: C.text, outline: "none",
  };

  if (!userGuild && !showCreate && !showJoin) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "40px 32px 120px",
        animation: "fadeIn 0.3s ease", position: "relative",
      }}>
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, height: "100vh",
          backgroundImage: "url(/guild-bg.png)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.25, pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏰</div>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.tabGuild, marginBottom: 8 }}>No Guild Yet</h3>
        <p style={{ color: C.textMuted, fontSize: 14, textAlign: "center", lineHeight: 1.6, marginBottom: 32 }}>
          Join forces with others. Create a guild or enter an invite code.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
          <button onClick={() => setShowCreate(true)} style={{
            padding: "14px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.tabGuild}, #16a34a)`,
            color: "#fff", fontSize: 15, fontWeight: 700, width: "100%",
          }}>Create a Guild</button>
          <button onClick={() => setShowJoin(true)} style={{
            padding: "14px 24px", borderRadius: 12, cursor: "pointer",
            background: C.surfaceLight, border: `1px solid ${C.border}`,
            color: C.text, fontSize: 15, fontWeight: 500, width: "100%",
          }}>Join with Invite Code</button>
        </div>
        </div>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div style={{ padding: "40px 24px 120px", animation: "fadeIn 0.3s ease" }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.gold, marginBottom: 20 }}>Create Guild</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="text" placeholder="Guild Name" value={guildName} onChange={e => setGuildName(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Description (optional)" value={guildDesc} onChange={e => setGuildDesc(e.target.value)} style={inputStyle} />
          {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
          <button onClick={async () => {
            if (!guildName.trim()) return;
            try { await onCreateGuild(guildName, guildDesc); setShowCreate(false); }
            catch (e) { setError(e.message); }
          }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.tabGuild}, #16a34a)`,
            color: "#fff", fontSize: 15, fontWeight: 700,
          }}>Found Guild</button>
          <button onClick={() => setShowCreate(false)} style={{
            background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14,
          }}>Cancel</button>
        </div>
      </div>
    );
  }

  if (showJoin) {
    return (
      <div style={{ padding: "40px 24px 120px", animation: "fadeIn 0.3s ease" }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.gold, marginBottom: 20 }}>Join Guild</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="text" placeholder="Enter invite code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={inputStyle} />
          {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
          <button onClick={async () => {
            if (!inviteCode.trim()) return;
            try { await onJoinByCode(inviteCode); setShowJoin(false); }
            catch (e) { setError(e.message || "Invalid invite code"); }
          }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            color: "#000", fontSize: 15, fontWeight: 700,
          }}>Join</button>
          <button onClick={() => setShowJoin(false)} style={{
            background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14,
          }}>Cancel</button>
        </div>
      </div>
    );
  }

  // Show guild info
  const guild = userGuild?.guilds || {};
  return (
    <div style={{ padding: "20px 16px 120px", animation: "fadeIn 0.3s ease", position: "relative", minHeight: "100vh" }}>
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/guild-bg.png)",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.25, pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{
        padding: 20, borderRadius: 16, textAlign: "center", marginBottom: 20,
        background: C.card, border: `1px solid ${C.cardBorder}`,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏰</div>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.tabGuild }}>{guild.name || "Guild"}</h3>
        {guild.description && <p style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>{guild.description}</p>}
        <div style={{
          marginTop: 16, padding: "8px 14px", background: C.surfaceLight, borderRadius: 8, display: "inline-block",
        }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Invite Code: </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.gold, fontFamily: "monospace" }}>{guild.invite_code || "—"}</span>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, fontFamily: "'Cinzel', serif" }}>
        Members
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {guildMembers.map((m, i) => {
          const p = m.profiles || {};
          const memberClass = CLASSES[p.class] || { emoji: "⚔️", title: "Adventurer" };
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: 14,
              background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12,
            }}>
              <span style={{ fontSize: 24 }}>{memberClass.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.display_name || "Member"}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Lv.{p.level || 1} {memberClass.title}</div>
              </div>
              {m.role === "leader" && <span style={{ fontSize: 11, color: C.gold }}>👑 Leader</span>}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ============================================
// AUTH SCREEN
// ============================================
