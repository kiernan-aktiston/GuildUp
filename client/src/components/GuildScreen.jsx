import { useState } from 'react';
import { C, CLASSES, getRank } from '../constants';
import { RARITIES, SLOTS } from '../equipmentData';
import { CHEST_TYPES, rollChest } from '../chestSystem';

const SHIELD_SHAPES = ["shield", "circle", "diamond", "banner"];
const CREST_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#78716c"];
const CREST_EMBLEMS = ["\u2694\uFE0F", "\u{1F6E1}\uFE0F", "\u{1F3F9}", "\u{1F4D6}", "\u{1F56F}\uFE0F", "\u{1F5E1}\uFE0F", "\u{1F525}", "\u26A1", "\u{1F33F}", "\u{1F480}", "\u{1F985}", "\u{1F43A}", "\u{1F981}", "\u{1F409}", "\u{1F451}", "\u{1F48E}"];

function GuildCrest({ crest = {}, size = 80 }) {
  const shape = crest.shape || "shield";
  const c1 = crest.color1 || "#3b82f6";
  const c2 = crest.color2 || "#1e3a5f";
  const emblem = crest.emblem || "\u2694\uFE0F";
  const s = size;
  const shieldPath = shape === "shield" ? `M${s/2} ${s*0.05} L${s*0.9} ${s*0.25} L${s*0.85} ${s*0.7} L${s/2} ${s*0.95} L${s*0.15} ${s*0.7} L${s*0.1} ${s*0.25} Z`
    : shape === "diamond" ? `M${s/2} ${s*0.05} L${s*0.95} ${s/2} L${s/2} ${s*0.95} L${s*0.05} ${s/2} Z`
    : shape === "banner" ? `M${s*0.1} ${s*0.05} L${s*0.9} ${s*0.05} L${s*0.9} ${s*0.85} L${s/2} ${s*0.95} L${s*0.1} ${s*0.85} Z` : null;
  const uid = `cg-${shape}-${c1.replace('#','')}-${size}`;
  return (
    <div style={{ width: s, height: s, position: "relative", display: "inline-block" }}>
      <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s}>
        <defs><linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
        {shape === "circle" ? <circle cx={s/2} cy={s/2} r={s*0.45} fill={`url(#${uid})`} stroke="#ffffff22" strokeWidth="1.5" /> : <path d={shieldPath} fill={`url(#${uid})`} stroke="#ffffff22" strokeWidth="1.5" />}
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: s * 0.35, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{emblem}</div>
    </div>
  );
}

const MAX_MEMBERS = 8;
const WEEKLY_CHEST_THRESHOLD = 15;

const SectionHeader = ({ children, color = C.gold }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color, whiteSpace: "nowrap" }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: `${color}22` }} />
  </div>
);

export default function GuildScreen({ userId, userGuild, guildMembers = [], onCreateGuild, onJoinByCode, onLeaveGuild, playerLevel = 1, inventory = [], onClaimGuildChest }) {
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
  const [crestEmblem, setCrestEmblem] = useState("\u2694\uFE0F");
  const [chestClaiming, setChestClaiming] = useState(false);
  const [chestReward, setChestReward] = useState(null);

  const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 14, background: C.surface, border: `1px solid ${C.border}`, color: C.text, outline: "none" };

  // ── NO GUILD STATE ──
  if (!userGuild) {
    return (
      <div style={{ padding: "16px 18px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease" }}>
        {!showCreate && !showJoin ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: 2, marginBottom: 4 }}>Guilds</div>
            <div style={{ fontSize: 14, color: C.textMuted, textAlign: "center", maxWidth: 280, lineHeight: 1.6, marginBottom: 16 }}>You don't belong to a country. You belong to a guild.</div>
            <button onClick={() => setShowCreate(true)} style={{ width: 240, padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", background: C.gold, color: "#000", fontSize: 15, fontWeight: 600 }}>Found a Guild</button>
            <button onClick={() => setShowJoin(true)} style={{ width: 240, padding: "14px", borderRadius: 20, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.text, fontSize: 15, fontWeight: 500 }}>Join by Code</button>
          </div>
        ) : showCreate ? (
          <div>
            <button onClick={() => { setShowCreate(false); setError(""); }} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 }}>{"\u2190"} Back</button>
            <SectionHeader>Found a Guild</SectionHeader>
            <div style={{ textAlign: "center", marginBottom: 16 }}><GuildCrest crest={{ shape: crestShape, color1: crestColor1, color2: crestColor2, emblem: crestEmblem }} size={80} /></div>

            {/* Crest customization */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Shape</div>
              <div style={{ display: "flex", gap: 8 }}>{SHIELD_SHAPES.map(s => (
                <button key={s} onClick={() => setCrestShape(s)} style={{ padding: "6px 14px", borderRadius: 20, border: crestShape === s ? `1px solid ${C.gold}` : `1px solid ${C.border}`, background: crestShape === s ? C.goldFaint : "transparent", color: crestShape === s ? C.gold : C.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
              ))}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Colors</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{CREST_COLORS.map(c => (
                <div key={c} onClick={() => { if (crestColor1 === c) return; setCrestColor2(crestColor1); setCrestColor1(c); }} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: crestColor1 === c ? "2px solid #fff" : "2px solid transparent" }} />
              ))}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Emblem</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{CREST_EMBLEMS.map(e => (
                <div key={e} onClick={() => setCrestEmblem(e)} style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", background: crestEmblem === e ? C.goldFaint : C.surface, border: crestEmblem === e ? `1px solid ${C.gold}33` : `1px solid ${C.border}` }}>{e}</div>
              ))}</div>
            </div>

            <input value={guildName} onChange={e => setGuildName(e.target.value)} placeholder="Guild Name" maxLength={30} style={{ ...inputStyle, marginBottom: 10 }} />
            <input value={guildDesc} onChange={e => setGuildDesc(e.target.value)} placeholder="Motto (optional)" maxLength={80} style={{ ...inputStyle, marginBottom: 16 }} />
            {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button onClick={async () => {
              if (!guildName.trim()) { setError("Name required"); return; }
              try {
                await onCreateGuild(guildName.trim(), guildDesc.trim(), { shape: crestShape, color1: crestColor1, color2: crestColor2, emblem: crestEmblem });
                setShowCreate(false); setError("");
              } catch (e) { setError(e.message); }
            }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", background: C.gold, color: "#000", fontSize: 15, fontWeight: 600 }}>Create Guild</button>
          </div>
        ) : (
          <div>
            <button onClick={() => { setShowJoin(false); setError(""); }} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 }}>{"\u2190"} Back</button>
            <SectionHeader>Join by Code</SectionHeader>
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="Enter invite code" maxLength={10} style={{ ...inputStyle, marginBottom: 16, fontFamily: "monospace", letterSpacing: 2, textAlign: "center", fontSize: 18 }} />
            {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button onClick={async () => {
              if (!inviteCode.trim()) { setError("Enter a code"); return; }
              try { await onJoinByCode(inviteCode.trim()); setShowJoin(false); setError(""); } catch (e) { setError(e.message); }
            }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", background: C.gold, color: "#000", fontSize: 15, fontWeight: 600 }}>Join</button>
          </div>
        )}
      </div>
    );
  }

  // ── GUILD HOME ──
  const guild = userGuild?.guilds || {};
  const guildCrest = guild.crest || { shape: "shield", color1: "#3b82f6", color2: "#1e3a5f", emblem: "\u2694\uFE0F" };
  const totalWeeklyRituals = guildMembers.reduce((sum, m) => sum + (m.weekly_rituals || 0), 0);
  const chestTarget = guildMembers.length * WEEKLY_CHEST_THRESHOLD;
  const chestProgress = Math.min((totalWeeklyRituals / Math.max(chestTarget, 1)) * 100, 100);
  const chestUnlocked = totalWeeklyRituals >= chestTarget;
  const sortedByActivity = [...guildMembers].sort((a, b) => (b.weekly_rituals || 0) - (a.weekly_rituals || 0));

  const handleShare = () => {
    const code = guild.invite_code || "";
    const text = `Join my guild "${guild.name}" on GuildUp! Code: ${code}\nhttps://guildup.app`;
    if (navigator.share) navigator.share({ title: "Join my GuildUp guild!", text }).catch(() => {});
    else navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ padding: "16px 18px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease", position: "relative" }}>
      {/* Faint topo background */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, height: "100vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 40% at 50% 20%, rgba(74, 124, 80, 0.03) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Guild header */}
        <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 8 }}><GuildCrest crest={guildCrest} size={72} /></div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: 1 }}>{guild.name || "Guild"}</div>
          {guild.description && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{guild.description}</div>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: C.gold }}>{guild.invite_code || "\u2014"}</span>
            <button onClick={handleShare} style={{ padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", background: C.green, color: "#fff", fontSize: 11, fontWeight: 600 }}>Share</button>
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>{guildMembers.length} / {MAX_MEMBERS} members</div>
        </div>

        {/* Weekly Chest */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader color={C.gold}>Weekly Guild Chest</SectionHeader>
          <div style={{ padding: "14px 16px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: chestUnlocked ? C.green : C.text }}>{chestUnlocked ? "Chest Unlocked!" : `${chestTarget - totalWeeklyRituals} more to unlock`}</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: C.textMuted }}>{totalWeeklyRituals}/{chestTarget}</span>
            </div>
            <div style={{ height: 4, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${chestProgress}%`, height: "100%", borderRadius: 2, background: chestUnlocked ? C.green : C.gold, transition: "width 0.5s ease" }} />
            </div>
            {chestUnlocked && (
              <button onClick={() => {
                setChestClaiming(true);
                const result = rollChest(CHEST_TYPES.guild, playerLevel, inventory);
                setTimeout(() => { setChestReward(result); setChestClaiming(false); onClaimGuildChest?.(result); }, 1000);
              }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", marginTop: 12, background: C.gold, color: "#000", fontSize: 15, fontWeight: 600 }}>{"\u{1F451}"} Claim Guild Chest</button>
            )}
          </div>
        </div>

        {/* Members */}
        <div style={{ marginBottom: 24 }}>
          <SectionHeader>Members</SectionHeader>
          <div>
            {sortedByActivity.map((m, i) => {
              const profile = m.profiles || {};
              const memberCls = CLASSES[profile.class] || CLASSES.warrior;
              const weeklyCount = m.weekly_rituals || 0;
              const isLeader = m.role === "leader";
              const isMostActive = i === 0 && weeklyCount > 0;
              return (
                <div key={m.user_id || i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 4px",
                  borderBottom: i < sortedByActivity.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: weeklyCount > 0 ? C.green : C.textDim, flexShrink: 0 }} />
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{memberCls.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{profile.display_name || "Member"}</span>
                      {isLeader && <span style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>LEADER</span>}
                      {isMostActive && !isLeader && <span style={{ fontSize: 9, color: C.green, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>MVP</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>Lv {profile.level || 1} {memberCls.title}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: weeklyCount > 0 ? C.gold : C.textDim }}>{weeklyCount}</div>
                    <div style={{ fontSize: 9, color: C.textDim }}>this week</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave */}
        <button onClick={() => setShowLeaveConfirm(true)} style={{ width: "100%", padding: "12px", borderRadius: 20, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.textDim, fontSize: 13, fontWeight: 500 }}>Leave Guild</button>
      </div>

      {/* Leave confirmation */}
      {showLeaveConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 320, padding: 24, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>Leave {guild.name}?</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 20 }}>Your contributions won't count toward the guild chest. You can join a new guild immediately.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { if (onLeaveGuild) onLeaveGuild(); setShowLeaveConfirm(false); }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", background: C.red, color: "#fff", fontSize: 14, fontWeight: 600 }}>Yes, Leave</button>
              <button onClick={() => setShowLeaveConfirm(false)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13 }}>Nevermind</button>
            </div>
          </div>
        </div>
      )}

      {/* Chest claiming */}
      {chestClaiming && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 80, marginBottom: 16, animation: "pulse 0.6s ease infinite" }}>{"\u{1F451}"}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.gold }}>Opening Guild Chest...</div>
          </div>
        </div>
      )}

      {/* Chest reveal */}
      {chestReward && !chestClaiming && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", width: "100%", maxWidth: 320, animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: 14, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Guild Chest Reward</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.gold, marginBottom: 8 }}>{"\u{1FA99}"} +{chestReward.gold}</div>
            {chestReward.item ? (() => {
              const rarity = RARITIES[chestReward.item.rarity];
              return (
                <>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>and an item...</div>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{SLOTS[chestReward.item.slot].emoji}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: rarity.color, marginBottom: 4 }}>{chestReward.item.name}</div>
                  <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>{rarity.label} {SLOTS[chestReward.item.slot].label}</div>
                </>
              );
            })() : (
              <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, marginTop: 8 }}>No item this time. The gold is yours.</div>
            )}
            <button onClick={() => setChestReward(null)} style={{ padding: "14px 48px", borderRadius: 20, border: "none", cursor: "pointer", background: chestReward.item ? RARITIES[chestReward.item.rarity].color : C.gold, color: "#000", fontSize: 15, fontWeight: 600 }}>{chestReward.item ? "Nice!" : "Onward"}</button>
          </div>
        </div>
      )}
    </div>
  );
}