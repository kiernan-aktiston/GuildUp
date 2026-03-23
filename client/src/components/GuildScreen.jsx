import { useState } from 'react';
import { C, CLASSES, getRank } from '../constants';

const SHIELD_SHAPES = ["shield", "circle", "diamond", "banner"];
const CREST_COLORS = [
  "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#78716c",
];
const CREST_EMBLEMS = ["⚔️", "🛡️", "🏹", "📖", "🕯️", "🗡️", "🔥", "⚡", "🌿", "💀", "🦅", "🐺", "🦁", "🐉", "👑", "💎"];

function GuildCrest({ crest = {}, size = 80 }) {
  const shape = crest.shape || "shield";
  const c1 = crest.color1 || "#3b82f6";
  const c2 = crest.color2 || "#1e3a5f";
  const emblem = crest.emblem || "⚔️";
  const s = size;
  const shieldPath = shape === "shield"
    ? `M${s/2} ${s*0.05} L${s*0.9} ${s*0.25} L${s*0.85} ${s*0.7} L${s/2} ${s*0.95} L${s*0.15} ${s*0.7} L${s*0.1} ${s*0.25} Z`
    : shape === "diamond"
    ? `M${s/2} ${s*0.05} L${s*0.95} ${s/2} L${s/2} ${s*0.95} L${s*0.05} ${s/2} Z`
    : shape === "banner"
    ? `M${s*0.1} ${s*0.05} L${s*0.9} ${s*0.05} L${s*0.9} ${s*0.85} L${s/2} ${s*0.95} L${s*0.1} ${s*0.85} Z`
    : null;
  const uid = `cg-${shape}-${c1.replace('#','')}-${size}`;
  return (
    <div style={{ width: s, height: s, position: "relative", display: "inline-block" }}>
      <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s}>
        <defs>
          <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {shape === "circle" ? (
          <circle cx={s/2} cy={s/2} r={s*0.45} fill={`url(#${uid})`} stroke="#ffffff33" strokeWidth="2" />
        ) : (
          <path d={shieldPath} fill={`url(#${uid})`} stroke="#ffffff33" strokeWidth="2" />
        )}
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: s * 0.35, lineHeight: 1,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
      }}>{emblem}</div>
    </div>
  );
}

const MAX_MEMBERS = 8;
const WEEKLY_CHEST_THRESHOLD = 15;

export default function GuildScreen({ userId, userGuild, guildMembers = [], onCreateGuild, onJoinByCode, onLeaveGuild }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildDesc, setGuildDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [crestShape, setCrestShape] = useState("shield");
  const [crestColor1, setCrestColor1] = useState("#3b82f6");
  const [crestColor2, setCrestColor2] = useState("#1e3a5f");
  const [crestEmblem, setCrestEmblem] = useState("⚔️");

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
    background: C.surfaceLight, border: `1px solid ${C.border}`,
    color: C.text, outline: "none",
  };

  const BgLayer = () => (
    <div style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, height: "100vh",
      backgroundImage: "url(/guild-bg.png)",
      backgroundSize: "cover", backgroundPosition: "center",
      opacity: 0.25, pointerEvents: "none", zIndex: 0,
    }} />
  );

  // ── NO GUILD ──
  if (!userGuild && !showCreate && !showJoin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <GuildCrest crest={{ shape: "shield", color1: "#2d7a4f", color2: "#1a4a30", emblem: "🏰" }} size={100} />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.gold, marginBottom: 8, marginTop: 16 }}>Find Your Guild</h3>
          <p style={{ color: C.textMuted, fontSize: 14, textAlign: "center", lineHeight: 1.6, marginBottom: 32, maxWidth: 280 }}>
            Join forces with up to 7 others. Complete rituals together. Unlock epic rewards as a team.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
            <button onClick={() => setShowCreate(true)} style={{
              padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "#22c55e", color: "#000", fontSize: 15, fontWeight: 700, width: "100%",
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

  // ── CREATE GUILD (with crest designer) ──
  if (showCreate) {
    return (
      <div style={{ minHeight: "100vh", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setShowCreate(false)} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 24, padding: 0,
          }}>← Back</button>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.gold, marginBottom: 20 }}>Found Your Guild</h3>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <GuildCrest crest={{ shape: crestShape, color1: crestColor1, color2: crestColor2, emblem: crestEmblem }} size={100} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input dir="ltr" type="text" placeholder="Guild Name" value={guildName} onChange={e => setGuildName(e.target.value)} style={inputStyle} />
            <input dir="ltr" type="text" placeholder="Description (optional)" value={guildDesc} onChange={e => setGuildDesc(e.target.value)} style={inputStyle} />

            <div>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Crest Shape</div>
              <div style={{ display: "flex", gap: 8 }}>
                {SHIELD_SHAPES.map(s => (
                  <button key={s} onClick={() => setCrestShape(s)} style={{
                    flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                    background: crestShape === s ? `${C.gold}22` : C.surfaceLight,
                    border: crestShape === s ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                    color: crestShape === s ? C.gold : C.textMuted,
                    fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Colors</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CREST_COLORS.map(c => (
                  <div key={c} onClick={() => {
                    if (crestColor1 !== c) setCrestColor1(c);
                    else setCrestColor2(c);
                  }} style={{
                    width: 32, height: 32, borderRadius: 8, background: c, cursor: "pointer",
                    border: (crestColor1 === c || crestColor2 === c) ? "3px solid #fff" : "2px solid transparent",
                    boxShadow: crestColor1 === c ? `0 0 10px ${c}66` : "none",
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Tap once for primary, twice for secondary</div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Emblem</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CREST_EMBLEMS.map(e => (
                  <div key={e} onClick={() => setCrestEmblem(e)} style={{
                    width: 40, height: 40, borderRadius: 10, cursor: "pointer",
                    background: crestEmblem === e ? `${C.gold}22` : C.surfaceLight,
                    border: crestEmblem === e ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>{e}</div>
                ))}
              </div>
            </div>

            {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}

            <button onClick={async () => {
              if (!guildName.trim()) return;
              try {
                const crest = { shape: crestShape, color1: crestColor1, color2: crestColor2, emblem: crestEmblem };
                await onCreateGuild(guildName, guildDesc, crest);
                setShowCreate(false);
              } catch (e) { setError(e.message || "Failed to create guild"); }
            }} style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "#22c55e", color: "#000", fontSize: 15, fontWeight: 700,
            }}>Found Guild</button>
          </div>
        </div>
      </div>
    );
  }

  // ── JOIN GUILD ──
  if (showJoin) {
    return (
      <div style={{ minHeight: "100vh", padding: "40px 24px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <BgLayer />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => setShowJoin(false)} style={{
            background: "none", border: "none", color: C.textMuted, fontSize: 14,
            cursor: "pointer", marginBottom: 24, padding: 0,
          }}>← Back</button>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.gold, marginBottom: 20 }}>Join a Guild</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input dir="ltr" type="text" placeholder="Enter invite code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={inputStyle} />
            {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
            <button onClick={async () => {
              if (!inviteCode.trim()) return;
              try { await onJoinByCode(inviteCode); setShowJoin(false); }
              catch (e) { setError(e.message || "Invalid invite code"); }
            }} style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              color: "#000", fontSize: 15, fontWeight: 700,
            }}>Join</button>
          </div>
        </div>
      </div>
    );
  }

  // ── GUILD HOME ──
  const guild = userGuild?.guilds || {};
  const guildCrest = guild.crest || { shape: "shield", color1: "#3b82f6", color2: "#1e3a5f", emblem: "⚔️" };
  const totalWeeklyRituals = guildMembers.reduce((sum, m) => sum + (m.weekly_rituals || 0), 0);
  const chestTarget = guildMembers.length * WEEKLY_CHEST_THRESHOLD;
  const chestProgress = Math.min((totalWeeklyRituals / Math.max(chestTarget, 1)) * 100, 100);
  const chestUnlocked = totalWeeklyRituals >= chestTarget;
  const sortedByActivity = [...guildMembers].sort((a, b) => (b.weekly_rituals || 0) - (a.weekly_rituals || 0));

  const handleShare = () => {
    const code = guild.invite_code || "";
    const text = `Join my guild "${guild.name}" on GuildUp! Use invite code: ${code}\nhttps://guildup.app`;
    if (navigator.share) {
      navigator.share({ title: "Join my GuildUp guild!", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div style={{ padding: "20px 16px 120px", animation: "fadeIn 0.3s ease", position: "relative", minHeight: "100vh" }}>
      <BgLayer />
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{
          padding: "20px", borderRadius: 16, textAlign: "center", marginBottom: 16,
          background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(8px)",
        }}>
          <div style={{ marginBottom: 8 }}>
            <GuildCrest crest={guildCrest} size={80} />
          </div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.gold }}>{guild.name || "Guild"}</h3>
          {guild.description && <p style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>{guild.description}</p>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
            <div style={{ padding: "6px 12px", background: C.surfaceLight, borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>Code: </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.gold, fontFamily: "monospace" }}>{guild.invite_code || "—"}</span>
            </div>
            <button onClick={handleShare} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: "#22c55e", color: "#000", fontSize: 12, fontWeight: 700,
            }}>Share</button>
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
            {guildMembers.length} / {MAX_MEMBERS} members
          </div>
        </div>

        {/* Weekly Chest Progress */}
        <div style={{
          padding: "16px", borderRadius: 14, marginBottom: 16,
          background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(8px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>Weekly Guild Chest</div>
            <span style={{ fontSize: 20 }}>{chestUnlocked ? "🎉" : "📦"}</span>
          </div>
          <div style={{ height: 8, background: C.surfaceLight, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            <div style={{
              width: `${chestProgress}%`, height: "100%", borderRadius: 4,
              background: chestUnlocked ? "linear-gradient(90deg, #22c55e, #16a34a)" : `linear-gradient(90deg, ${C.gold}, #f59e0b)`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{totalWeeklyRituals} / {chestTarget} rituals</span>
            <span style={{ fontSize: 12, color: chestUnlocked ? "#22c55e" : C.gold, fontWeight: 600 }}>
              {chestUnlocked ? "Epic Chest Unlocked!" : `${chestTarget - totalWeeklyRituals} more to unlock`}
            </span>
          </div>
          {chestUnlocked && (
            <div style={{
              marginTop: 10, padding: "8px 12px", borderRadius: 8, textAlign: "center",
              background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)",
            }}>
              <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>🎉 Every member earns an Epic Chest this week!</span>
            </div>
          )}
        </div>

        {/* Members */}
        <div style={{
          fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 1.5,
          textTransform: "uppercase", marginBottom: 10, fontFamily: "'Cinzel', serif",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>Members</span>
          <span style={{ fontSize: 10, color: C.textDim, fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>Sorted by activity</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {sortedByActivity.map((m, i) => {
            const p = m.profiles || {};
            const memberClass = CLASSES[p.class] || { emoji: "⚔️", title: "Adventurer", color: "#6b7280" };
            const memberRank = getRank(p.level || 1);
            const weeklyCount = m.weekly_rituals || 0;
            const isMe = m.user_id === userId;
            const isMostActive = i === 0 && weeklyCount > 0;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                background: isMe ? `${C.gold}0a` : C.card,
                border: `1px solid ${isMe ? `${C.gold}33` : C.cardBorder}`,
                borderRadius: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: weeklyCount > 0 ? "#22c55e" : "#4b5563",
                  boxShadow: weeklyCount > 0 ? "0 0 6px #22c55e44" : "none",
                }} />
                <span style={{ fontSize: 22 }}>{memberClass.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isMe ? C.gold : C.text }}>
                      {p.display_name || "Member"}
                    </span>
                    {m.role === "leader" && <span style={{ fontSize: 10 }}>👑</span>}
                    {isMostActive && <span style={{ fontSize: 10 }}>🔥</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>
                    Lv.{p.level || 1} {memberClass.title} · {memberRank}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: weeklyCount > 0 ? C.gold : C.textDim }}>{weeklyCount}</div>
                  <div style={{ fontSize: 9, color: C.textDim }}>this week</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleShare} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "#22c55e", color: "#000", fontSize: 14, fontWeight: 700,
          }}>Invite Friends</button>
          <button onClick={() => setShowLeaveConfirm(true)} style={{
            width: "100%", padding: "12px", borderRadius: 12, cursor: "pointer",
            background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 500,
            border: "1px solid #7f1d1d",
          }}>Leave Guild</button>
        </div>

        {/* Leave confirm */}
        {showLeaveConfirm && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)", display: "flex",
            alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.3s ease", padding: 24,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: "100%", maxWidth: 320, padding: 28, borderRadius: 20,
              background: C.surface, border: `1px solid ${C.border}`, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.text, marginBottom: 8 }}>
                Leave {guild.name}?
              </div>
              <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
                Your ritual contributions this week won't count toward the guild chest. You can join a new guild immediately.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => {
                  if (onLeaveGuild) onLeaveGuild();
                  setShowLeaveConfirm(false);
                }} style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "#ef4444", color: "#000", fontSize: 14, fontWeight: 700,
                }}>Yes, Leave Guild</button>
                <button onClick={() => setShowLeaveConfirm(false)} style={{
                  background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13,
                }}>Nevermind</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}