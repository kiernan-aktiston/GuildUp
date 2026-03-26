import { useState } from 'react';
import { C, CLASSES, getRank } from '../constants';
import { ITEMS, SLOTS, RARITIES, getItem, calcEquipmentBonuses } from '../equipmentData';

const SUB_TABS = [
  { key: "avatar", label: "Avatar" },
  { key: "inventory", label: "Inventory" },
  { key: "spells", label: "Spells" },
];

const SectionHeader = ({ children, color = C.gold }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color, whiteSpace: "nowrap" }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: `${color}22` }} />
  </div>
);

export default function AvatarScreen({ playerClass = "warrior", playerLevel = 1, playerStats = {}, playerGold = 0, playerName = "Adventurer", onSignOut, avatarUrl, onAvatarUpload, inventory = [], equipment = {}, onEquip, onUnequip, onSell, inventoryCap = 50 }) {
  const [subTab, setSubTab] = useState("avatar");
  const [inspectItem, setInspectItem] = useState(null);
  const [sellConfirm, setSellConfirm] = useState(null);
  const [filterSlot, setFilterSlot] = useState("all");
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const equipBonuses = calcEquipmentBonuses(equipment);

  const baseStats = { str: playerStats.str || 10, agi: playerStats.agi || 10, int: playerStats.int || 10, spi: playerStats.spi || 10, cha: playerStats.cha || 10 };
  const totalStats = { str: baseStats.str + (equipBonuses.str || 0), agi: baseStats.agi + (equipBonuses.agi || 0), int: baseStats.int + (equipBonuses.int || 0), spi: baseStats.spi + (equipBonuses.spi || 0), cha: baseStats.cha + (equipBonuses.cha || 0) };
  const maxStat = Math.max(...Object.values(totalStats), 1);

  const stats = [
    { label: "Strength", key: "str", base: baseStats.str, bonus: equipBonuses.str || 0, total: totalStats.str, color: "#ef4444" },
    { label: "Agility", key: "agi", base: baseStats.agi, bonus: equipBonuses.agi || 0, total: totalStats.agi, color: "#4a7c50" },
    { label: "Intelligence", key: "int", base: baseStats.int, bonus: equipBonuses.int || 0, total: totalStats.int, color: "#4a6a94" },
    { label: "Spirit", key: "spi", base: baseStats.spi, bonus: equipBonuses.spi || 0, total: totalStats.spi, color: "#6b4a8c" },
    { label: "Charisma", key: "cha", base: baseStats.cha, bonus: equipBonuses.cha || 0, total: totalStats.cha, color: "#c9a84c" },
  ];

  return (
    <div style={{ padding: "16px 18px 120px", minHeight: "100vh", background: C.bg, animation: "fadeIn 0.3s ease" }}>
      <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const file = e.target.files?.[0]; if (file && onAvatarUpload) onAvatarUpload(file); e.target.value = ""; }} />

      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <div onClick={() => document.getElementById("avatar-upload")?.click()} style={{
          width: 52, height: 52, borderRadius: 14, overflow: "hidden", flexShrink: 0,
          border: `1px solid ${C.border}`, cursor: "pointer",
          background: C.surface, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 26 }}>{cls.emoji}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.text }}>{playerName}</div>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>{cls.title} {"\u00B7"} Lv {playerLevel} {"\u00B7"} {rank}</div>
        </div>
        <div style={{ fontSize: 13, fontFamily: "monospace", color: C.gold, fontWeight: 600 }}>{"\u{1FA99}"} {playerGold}</div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        {SUB_TABS.map(t => {
          const active = subTab === t.key;
          return (
            <button key={t.key} onClick={() => setSubTab(t.key)} style={{
              flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: 0.5,
              background: "transparent", color: active ? C.gold : C.textDim,
              borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* ═══ AVATAR TAB ═══ */}
      {subTab === "avatar" && (
        <div>
          {/* Equipment slots */}
          <SectionHeader>Equipment</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
            {Object.entries(SLOTS).map(([slotKey, slotInfo]) => {
              const equippedId = equipment[slotKey];
              const item = equippedId ? getItem(equippedId) : null;
              const rarity = item ? RARITIES[item.rarity] : null;
              return (
                <div key={slotKey} onClick={() => { if (item) setInspectItem(item); }} style={{
                  padding: "12px", borderRadius: 12, cursor: item ? "pointer" : "default",
                  background: item ? `${rarity.color}08` : C.surface,
                  border: `1px solid ${item ? `${rarity.color}33` : C.border}`,
                }}>
                  <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{slotInfo.label}</div>
                  {item ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: rarity.color }}>{item.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                        {Object.entries(item.stats).map(([stat, val]) => (
                          <span key={stat} style={{ fontSize: 9, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: val > 0 ? C.greenFaint : "rgba(239,68,68,0.12)", color: val > 0 ? C.green : "#ef4444" }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>Empty</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <SectionHeader>Stats</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stats.map(s => (
              <div key={s.key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: s.color }}>
                    {s.total}
                    {s.bonus !== 0 && <span style={{ fontSize: 10, color: s.bonus > 0 ? C.green : "#ef4444", marginLeft: 4 }}>({s.bonus > 0 ? "+" : ""}{s.bonus})</span>}
                  </span>
                </div>
                <div style={{ height: 3, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, width: `${(s.total / maxStat) * 100}%`, background: s.color, transition: "width 0.3s ease" }} />
                </div>
              </div>
            ))}
          </div>

          <button onClick={onSignOut} style={{
            width: "100%", padding: "12px", borderRadius: 20, border: `1px solid ${C.border}`,
            cursor: "pointer", background: "transparent", color: C.textDim,
            fontSize: 13, fontWeight: 500, marginTop: 24,
          }}>Sign Out</button>
        </div>
      )}

      {/* ═══ INVENTORY TAB ═══ */}
      {subTab === "inventory" && (
        <div>
          {/* Capacity */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: C.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Inventory</span>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: inventory.length >= inventoryCap ? "#ef4444" : inventory.length >= inventoryCap * 0.8 ? C.gold : C.textMuted }}>{inventory.length} / {inventoryCap}</span>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["all", `All (${inventory.length})`], ...Object.entries(SLOTS).map(([k, v]) => [k, `${v.emoji} ${inventory.filter(id => getItem(id)?.slot === k).length}`])].map(([key, label]) => (
              <button key={key} onClick={() => setFilterSlot(key)} style={{
                padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600,
                background: filterSlot === key ? C.gold : C.surface,
                color: filterSlot === key ? "#000" : C.textMuted,
              }}>{label}</button>
            ))}
          </div>

          {inventory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 15, color: C.textMuted }}>Your inventory is empty.</div>
              <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>Visit the Store to buy equipment.</div>
            </div>
          ) : (
            <div>
              {inventory.map(id => getItem(id)).filter(item => item && (filterSlot === "all" || item.slot === filterSlot))
                .sort((a, b) => { const ro = { common: 0, rare: 1, epic: 2 }; return (ro[b.rarity] || 0) - (ro[a.rarity] || 0); })
                .map((item, i, arr) => {
                  const rarity = RARITIES[item.rarity];
                  const isEquipped = Object.values(equipment).includes(item.id);
                  return (
                    <div key={item.id} onClick={() => setInspectItem(item)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "14px 4px",
                      borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                      cursor: "pointer", opacity: isEquipped ? 1 : 0.8,
                    }}>
                      <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{SLOTS[item.slot]?.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: rarity.color }}>{item.name}</span>
                          {isEquipped && <span style={{ fontSize: 9, color: C.green, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>EQUIPPED</span>}
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                          {Object.entries(item.stats).map(([stat, val]) => (
                            <span key={stat} style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: val > 0 ? C.greenFaint : "rgba(239,68,68,0.12)", color: val > 0 ? C.green : "#ef4444" }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ═══ SPELLS TAB ═══ */}
      {subTab === "spells" && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 4 }}>Spells & Abilities</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>Coming soon.</div>
        </div>
      )}

      {/* ═══ ITEM INSPECT MODAL ═══ */}
      {inspectItem && (() => {
        const rarity = RARITIES[inspectItem.rarity];
        const slot = SLOTS[inspectItem.slot];
        const isOwned = inventory.includes(inspectItem.id);
        const isEquipped = Object.values(equipment).includes(inspectItem.id);
        const currentlyEquipped = equipment[inspectItem.slot] ? getItem(equipment[inspectItem.slot]) : null;
        return (
          <div onClick={() => { setInspectItem(null); setSellConfirm(null); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, padding: 24, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{slot.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{inspectItem.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                {Object.entries(inspectItem.stats).map(([stat, val]) => (
                  <div key={stat} style={{ padding: "4px 10px", borderRadius: 6, background: val > 0 ? C.greenFaint : "rgba(239,68,68,0.12)", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: val > 0 ? C.green : "#ef4444" }}>{val > 0 ? "+" : ""}{val}</div>
                    <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase" }}>{stat}</div>
                  </div>
                ))}
              </div>
              {/* Comparison */}
              {isOwned && !isEquipped && currentlyEquipped && (
                <div style={{ padding: "10px", borderRadius: 10, background: C.surfaceLight, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>vs. {currentlyEquipped.name}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["str", "agi", "int", "spi", "cha"].map(stat => {
                      const diff = (inspectItem.stats[stat] || 0) - (currentlyEquipped.stats[stat] || 0);
                      if (diff === 0) return null;
                      return <span key={stat} style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: diff > 0 ? C.greenFaint : "rgba(239,68,68,0.12)", color: diff > 0 ? C.green : "#ef4444" }}>{diff > 0 ? "\u25B2" : "\u25BC"}{Math.abs(diff)} {stat.toUpperCase()}</span>;
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {isOwned && !isEquipped && playerLevel >= inspectItem.levelReq && (
                  <button onClick={() => { onEquip?.(inspectItem.slot, inspectItem.id); setInspectItem(null); setSellConfirm(null); }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: C.green, color: "#fff" }}>Equip</button>
                )}
                {isEquipped && (
                  <button onClick={() => { onUnequip?.(inspectItem.slot); setInspectItem(null); setSellConfirm(null); }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: C.red, color: "#fff" }}>Unequip</button>
                )}
                {isOwned && !isEquipped && (
                  sellConfirm === inspectItem.id ? (
                    <button onClick={() => { onSell?.(inspectItem.id); setInspectItem(null); setSellConfirm(null); }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: C.gold, color: "#000" }}>Confirm Sell {"\u2014"} {"\u{1FA99}"} +{Math.floor(inspectItem.price * 0.35)}</button>
                  ) : (
                    <button onClick={() => setSellConfirm(inspectItem.id)} style={{ width: "100%", padding: "12px", borderRadius: 20, border: `1px solid ${C.gold}33`, cursor: "pointer", background: C.goldFaint, color: C.gold, fontSize: 13, fontWeight: 600 }}>Sell {"\u2014"} {"\u{1FA99}"} {Math.floor(inspectItem.price * 0.35)}</button>
                  )
                )}
                <button onClick={() => { setInspectItem(null); setSellConfirm(null); }} style={{ width: "100%", padding: "12px", borderRadius: 20, border: `1px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 500 }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}