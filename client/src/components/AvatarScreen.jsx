import { useState } from 'react';
import { C, CLASSES, getRank } from '../constants';
import { statPointsForLevel } from '../gameLogic';
import { ITEMS, SLOTS, RARITIES, getItem, getItemsBySlot, calcEquipmentBonuses, getSpritePath, EMPTY_EQUIPMENT } from '../equipmentData';

const SUB_TABS = [
  { key: "avatar", label: "Avatar", emoji: "\u2694\uFE0F" },
  { key: "inventory", label: "Inventory", emoji: "\u{1F392}" },
  { key: "spells", label: "Spells", emoji: "\u2728" },
];

export default function AvatarScreen({ playerClass = "warrior", playerLevel = 1, playerStats = {}, playerGold = 0, playerName = "Adventurer", onSignOut, avatarUrl, onAvatarUpload, inventory = [], equipment = {}, onEquip, onUnequip }) {
  const [subTab, setSubTab] = useState("avatar");
  const [inspectItem, setInspectItem] = useState(null);
  const [filterSlot, setFilterSlot] = useState("all");
  const cls = CLASSES[playerClass] || CLASSES.warrior;
  const rank = getRank(playerLevel);
  const equipBonuses = calcEquipmentBonuses(equipment);

  const baseStats = {
    str: playerStats.str || 10, agi: playerStats.agi || 10,
    int: playerStats.int || 10, spi: playerStats.spi || 10, cha: playerStats.cha || 10,
  };
  const totalStats = {
    str: baseStats.str + (equipBonuses.str || 0),
    agi: baseStats.agi + (equipBonuses.agi || 0),
    int: baseStats.int + (equipBonuses.int || 0),
    spi: baseStats.spi + (equipBonuses.spi || 0),
    cha: baseStats.cha + (equipBonuses.cha || 0),
  };
  const maxStat = Math.max(...Object.values(totalStats), 1);

  const stats = [
    { label: "Strength", key: "str", base: baseStats.str, bonus: equipBonuses.str || 0, total: totalStats.str, color: "#ef4444" },
    { label: "Agility", key: "agi", base: baseStats.agi, bonus: equipBonuses.agi || 0, total: totalStats.agi, color: "#22c55e" },
    { label: "Intelligence", key: "int", base: baseStats.int, bonus: equipBonuses.int || 0, total: totalStats.int, color: "#3b82f6" },
    { label: "Spirit", key: "spi", base: baseStats.spi, bonus: equipBonuses.spi || 0, total: totalStats.spi, color: "#a855f7" },
    { label: "Charisma", key: "cha", base: baseStats.cha, bonus: equipBonuses.cha || 0, total: totalStats.cha, color: "#f59e0b" },
  ];

  // Layered character display
  const CharacterDisplay = ({ size = 256 }) => {
    const scale = size / 512;
    return (
      <div style={{ position: "relative", width: size, height: size * 2, margin: "0 auto" }}>
        {/* Base character */}
        <img src="/character-base.png" alt="Character" style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          objectFit: "contain", imageRendering: "auto",
        }} onError={e => { e.target.style.display = "none"; }} />
        {/* Equipment layers — rendered in order: chest, offhand, head (top) */}
        {["chest", "offhand", "head"].map(slot => {
          const itemId = equipment[slot];
          if (!itemId) return null;
          const path = getSpritePath(itemId);
          if (!path) return null;
          return (
            <img key={slot} src={path} alt={slot} style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              objectFit: "contain", imageRendering: "auto",
            }} onError={e => { e.target.style.display = "none"; }} />
          );
        })}
        {/* Fallback when no base image exists */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: -1,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: size * 0.35 }}>{cls.emoji}</div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Character sprite coming soon</div>
          </div>
        </div>
      </div>
    );
  };

  // Item card component
  const ItemCard = ({ item, isEquipped, onTap }) => {
    const rarity = RARITIES[item.rarity];
    const slot = SLOTS[item.slot];
    return (
      <div onClick={() => onTap?.(item)} style={{
        padding: "12px 14px", borderRadius: 12, cursor: "pointer",
        background: isEquipped ? `${rarity.bgColor}` : C.card,
        border: isEquipped ? `2px solid ${rarity.color}` : `1px solid ${C.cardBorder}`,
        transition: "all 0.2s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: rarity.bgColor, border: `1px solid ${rarity.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>{slot.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: rarity.color }}>{item.name}</span>
              {isEquipped && <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>EQUIPPED</span>}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{item.desc}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              {Object.entries(item.stats).map(([stat, val]) => (
                <span key={stat} style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  color: val > 0 ? "#22c55e" : "#ef4444",
                }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px 16px 120px", minHeight: "100vh", animation: "fadeIn 0.3s ease", position: "relative" }}>
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/avatar-bg.png)", backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.2, pointerEvents: "none", zIndex: 0,
      }} />

      <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const file = e.target.files?.[0]; if (file && onAvatarUpload) onAvatarUpload(file); e.target.value = ""; }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <div onClick={() => document.getElementById("avatar-upload")?.click()} style={{
            width: 56, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0,
            border: `2px solid ${cls.color}44`, cursor: "pointer",
            background: C.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 28 }}>{cls.emoji}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: C.text }}>{playerName}</div>
            <div style={{ fontSize: 11, color: cls.color, fontWeight: 600 }}>{cls.title} {"\u00B7"} Lv {playerLevel} {"\u00B7"} {rank}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{"\u{1FA99}"} {playerGold}</div>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.surfaceLight, borderRadius: 12, padding: 4 }}>
          {SUB_TABS.map(t => {
            const active = subTab === t.key;
            return (
              <button key={t.key} onClick={() => setSubTab(t.key)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
                background: active ? C.card : "transparent",
                color: active ? C.gold : C.textMuted,
              }}>{t.emoji} {t.label}</button>
            );
          })}
        </div>

        {/* ═══ AVATAR SUB-TAB ═══ */}
        {subTab === "avatar" && (
          <div style={{ animation: "fadeIn 0.25s ease" }}>
            {/* Character display */}
            <div style={{
              padding: "20px", borderRadius: 16, marginBottom: 16,
              background: C.card, border: `1px solid ${C.cardBorder}`,
              textAlign: "center",
            }}>
              <CharacterDisplay size={180} />
            </div>

            {/* Equipment slots */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Equipment</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(SLOTS).map(([slotKey, slotInfo]) => {
                  const equippedId = equipment[slotKey];
                  const item = equippedId ? getItem(equippedId) : null;
                  const rarity = item ? RARITIES[item.rarity] : null;
                  return (
                    <div key={slotKey} onClick={() => { if (item) setInspectItem(item); }} style={{
                      padding: "12px", borderRadius: 12, cursor: item ? "pointer" : "default",
                      background: item ? rarity.bgColor : C.surfaceLight,
                      border: item ? `1px solid ${rarity.border}` : `1px dashed ${C.border}`,
                    }}>
                      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{slotInfo.emoji} {slotInfo.label}</div>
                      {item ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: rarity.color }}>{item.name}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                            {Object.entries(item.stats).map(([stat, val]) => (
                              <span key={stat} style={{
                                fontSize: 9, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
                                background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                color: val > 0 ? "#22c55e" : "#ef4444",
                              }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
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
            </div>

            {/* Stats with equipment bonuses */}
            <div style={{
              padding: "16px", borderRadius: 14,
              background: C.card, border: `1px solid ${C.cardBorder}`,
            }}>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Stats</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.map(s => (
                  <div key={s.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>
                        {s.total}
                        {s.bonus !== 0 && (
                          <span style={{ fontSize: 10, color: s.bonus > 0 ? "#22c55e" : "#ef4444", marginLeft: 4 }}>
                            ({s.bonus > 0 ? "+" : ""}{s.bonus})
                          </span>
                        )}
                      </span>
                    </div>
                    <div style={{ height: 4, background: C.surfaceLight, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${(s.total / maxStat) * 100}%`,
                        background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign out */}
            <button onClick={onSignOut} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${C.border}`,
              cursor: "pointer", background: "transparent", color: C.textDim,
              fontSize: 13, fontWeight: 500, marginTop: 16,
            }}>Sign Out</button>
          </div>
        )}

        {/* ═══ INVENTORY SUB-TAB ═══ */}
        {subTab === "inventory" && (
          <div style={{ animation: "fadeIn 0.25s ease" }}>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              <button onClick={() => setFilterSlot("all")} style={{
                padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: filterSlot === "all" ? C.gold : C.surfaceLight,
                color: filterSlot === "all" ? "#000" : C.textMuted,
              }}>All ({inventory.length})</button>
              {Object.entries(SLOTS).map(([key, info]) => {
                const count = inventory.filter(id => getItem(id)?.slot === key).length;
                return (
                  <button key={key} onClick={() => setFilterSlot(key)} style={{
                    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    background: filterSlot === key ? C.gold : C.surfaceLight,
                    color: filterSlot === key ? "#000" : C.textMuted,
                  }}>{info.emoji} {count}</button>
                );
              })}
            </div>

            {/* Item list */}
            {inventory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u{1F392}"}</div>
                <div style={{ fontSize: 15, color: C.textMuted }}>Your inventory is empty.</div>
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>Visit the Store to buy equipment.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {inventory
                  .map(id => getItem(id))
                  .filter(item => item && (filterSlot === "all" || item.slot === filterSlot))
                  .sort((a, b) => {
                    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
                    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
                  })
                  .map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isEquipped={Object.values(equipment).includes(item.id)}
                      onTap={() => setInspectItem(item)}
                    />
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ═══ SPELLS SUB-TAB (placeholder) ═══ */}
        {subTab === "spells" && (
          <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeIn 0.25s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2728"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Spells & Abilities</div>
            <div style={{ fontSize: 14, color: C.textMuted }}>Class-specific powers are being forged.</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 8 }}>Coming soon.</div>
          </div>
        )}
      </div>

      {/* ═══ ITEM INSPECT MODAL ═══ */}
      {inspectItem && (() => {
        const rarity = RARITIES[inspectItem.rarity];
        const slot = SLOTS[inspectItem.slot];
        const isOwned = inventory.includes(inspectItem.id);
        const isEquipped = Object.values(equipment).includes(inspectItem.id);
        const currentlyEquipped = equipment[inspectItem.slot] ? getItem(equipment[inspectItem.slot]) : null;
        return (
          <div onClick={() => setInspectItem(null)} style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)", display: "flex",
            alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease", padding: 24,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: "100%", maxWidth: 340, padding: 24, borderRadius: 20,
              background: C.surface, border: `1px solid ${rarity.border}`,
            }}>
              {/* Item header */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, margin: "0 auto 12px",
                  background: rarity.bgColor, border: `2px solid ${rarity.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32,
                }}>{slot.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{inspectItem.desc}</div>
              </div>

              {/* Stats */}
              <div style={{ padding: "12px", borderRadius: 10, background: C.surfaceLight, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {Object.entries(inspectItem.stats).map(([stat, val]) => (
                    <div key={stat} style={{
                      padding: "4px 10px", borderRadius: 6,
                      background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: val > 0 ? "#22c55e" : "#ef4444" }}>{val > 0 ? "+" : ""}{val}</div>
                      <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{stat}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Level requirement */}
              {inspectItem.levelReq > 1 && (
                <div style={{ fontSize: 11, color: playerLevel >= inspectItem.levelReq ? C.textDim : "#ef4444", textAlign: "center", marginBottom: 12 }}>
                  Requires Level {inspectItem.levelReq} {playerLevel < inspectItem.levelReq ? `(you are ${playerLevel})` : "\u2713"}
                </div>
              )}

              {/* Comparison with currently equipped */}
              {isOwned && !isEquipped && currentlyEquipped && (
                <div style={{ padding: "10px", borderRadius: 8, background: C.card, border: `1px solid ${C.cardBorder}`, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>vs. {currentlyEquipped.name}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["str", "agi", "int", "spi", "cha"].map(stat => {
                      const diff = (inspectItem.stats[stat] || 0) - (currentlyEquipped.stats[stat] || 0);
                      if (diff === 0) return null;
                      return (
                        <span key={stat} style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                          background: diff > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: diff > 0 ? "#22c55e" : "#ef4444",
                        }}>{diff > 0 ? "\u25B2" : "\u25BC"}{Math.abs(diff)} {stat.toUpperCase()}</span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {isOwned && !isEquipped && playerLevel >= inspectItem.levelReq && (
                  <button onClick={() => { onEquip?.(inspectItem.slot, inspectItem.id); setInspectItem(null); }} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 15, fontWeight: 700,
                    background: "#22c55e", color: "#000",
                  }}>Equip</button>
                )}
                {isEquipped && (
                  <button onClick={() => { onUnequip?.(inspectItem.slot); setInspectItem(null); }} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 15, fontWeight: 700,
                    background: "#ef4444", color: "#000",
                  }}>Unequip</button>
                )}
                <button onClick={() => setInspectItem(null)} style={{
                  width: "100%", padding: "12px", borderRadius: 12,
                  border: `1px solid ${C.border}`, cursor: "pointer",
                  background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 600,
                }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}