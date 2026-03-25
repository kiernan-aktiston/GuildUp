import { useState } from 'react';
import { C } from '../constants';
import { ITEMS, SLOTS, RARITIES, getItem } from '../equipmentData';

export default function StoreScreen({ playerGold = 0, playerLevel = 1, inventory = [], onBuy }) {
  const [filterSlot, setFilterSlot] = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [inspectItem, setInspectItem] = useState(null);
  const [buyConfirm, setBuyConfirm] = useState(null);
  const [justBought, setJustBought] = useState(null);

  const availableItems = ITEMS
    .filter(i => !inventory.includes(i.id))
    .filter(i => filterSlot === "all" || i.slot === filterSlot)
    .filter(i => filterRarity === "all" || i.rarity === filterRarity)
    .sort((a, b) => a.price - b.price);

  const ownedCount = inventory.length;

  const handleBuy = (item) => {
    if (playerGold < item.price || playerLevel < item.levelReq) return;
    onBuy?.(item.id, item.price);
    setBuyConfirm(null);
    setJustBought(item.id);
    setTimeout(() => setJustBought(null), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh", position: "relative", animation: "fadeIn 0.3s ease",
      padding: "24px 16px 120px",
    }}>
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh",
        backgroundImage: "url(/store-bg.png)", backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.25, pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Marketplace</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.text }}>The Armory</div>
          </div>
          <div style={{
            padding: "8px 16px", borderRadius: 10,
            background: C.card, border: `1px solid ${C.cardBorder}`,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 18 }}>{"\u{1FA99}"}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.gold, fontFamily: "'Cinzel', serif" }}>{playerGold}</span>
          </div>
        </div>

        {/* Slot filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
          <button onClick={() => setFilterSlot("all")} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            background: filterSlot === "all" ? C.gold : C.surfaceLight,
            color: filterSlot === "all" ? "#000" : C.textMuted,
          }}>All</button>
          {Object.entries(SLOTS).map(([key, info]) => (
            <button key={key} onClick={() => setFilterSlot(key)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              background: filterSlot === key ? C.gold : C.surfaceLight,
              color: filterSlot === key ? "#000" : C.textMuted,
            }}>{info.emoji} {info.label}</button>
          ))}
        </div>

        {/* Rarity filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
          <button onClick={() => setFilterRarity("all")} style={{
            padding: "4px 10px", borderRadius: 16, border: "none", cursor: "pointer",
            fontSize: 10, fontWeight: 600, whiteSpace: "nowrap",
            background: filterRarity === "all" ? C.surfaceLight : "transparent",
            color: filterRarity === "all" ? C.text : C.textDim,
          }}>All Rarities</button>
          {Object.entries(RARITIES).map(([key, info]) => (
            <button key={key} onClick={() => setFilterRarity(key)} style={{
              padding: "4px 10px", borderRadius: 16, border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: 600, whiteSpace: "nowrap",
              background: filterRarity === key ? info.bgColor : "transparent",
              color: filterRarity === key ? info.color : C.textDim,
            }}>{info.label}</button>
          ))}
        </div>

        {/* Item grid */}
        {availableItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u2694\uFE0F"}</div>
            <div style={{ fontSize: 15, color: C.textMuted }}>
              {ownedCount === ITEMS.length ? "You own everything. Impressive." : "No items match your filters."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {availableItems.map(item => {
              const rarity = RARITIES[item.rarity];
              const slot = SLOTS[item.slot];
              const canAfford = playerGold >= item.price;
              const meetsLevel = playerLevel >= item.levelReq;
              const wasBought = justBought === item.id;
              return (
                <div key={item.id} onClick={() => { if (!wasBought) setInspectItem(item); }} style={{
                  padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                  background: wasBought ? "rgba(34,197,94,0.15)" : C.card,
                  border: wasBought ? "2px solid #22c55e" : `1px solid ${C.cardBorder}`,
                  opacity: wasBought ? 0.6 : 1, transition: "all 0.3s ease",
                }}>
                  {wasBought ? (
                    <div style={{ textAlign: "center", color: "#22c55e", fontWeight: 700 }}>{"\u2713"} Purchased!</div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: rarity.bgColor, border: `1px solid ${rarity.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 24,
                      }}>{slot.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: rarity.color }}>{item.name}</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.desc}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                          {Object.entries(item.stats).map(([stat, val]) => (
                            <span key={stat} style={{
                              fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                              background: val > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                              color: val > 0 ? "#22c55e" : "#ef4444",
                            }}>{val > 0 ? "+" : ""}{val} {stat.toUpperCase()}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: canAfford ? C.gold : "#ef4444" }}>{"\u{1FA99}"} {item.price}</div>
                        {!meetsLevel && <div style={{ fontSize: 9, color: "#ef4444" }}>Lv {item.levelReq}</div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ ITEM INSPECT / BUY MODAL ═══ */}
      {inspectItem && (() => {
        const rarity = RARITIES[inspectItem.rarity];
        const slot = SLOTS[inspectItem.slot];
        const canAfford = playerGold >= inspectItem.price;
        const meetsLevel = playerLevel >= inspectItem.levelReq;
        return (
          <div onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)", display: "flex",
            alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease", padding: 24,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: "100%", maxWidth: 340, padding: 24, borderRadius: 20,
              background: C.surface, border: `1px solid ${rarity.border}`,
            }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, margin: "0 auto 12px",
                  background: rarity.bgColor, border: `2px solid ${rarity.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 36,
                }}>{slot.emoji}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: rarity.color }}>{inspectItem.name}</div>
                <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{rarity.label} {slot.label}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{inspectItem.desc}</div>
              </div>

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

              {inspectItem.levelReq > 1 && (
                <div style={{ fontSize: 11, color: meetsLevel ? C.textDim : "#ef4444", textAlign: "center", marginBottom: 12 }}>
                  Requires Level {inspectItem.levelReq} {meetsLevel ? "\u2713" : `(you are ${playerLevel})`}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {buyConfirm === inspectItem.id ? (
                  <button onClick={() => handleBuy(inspectItem)} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: "pointer", fontSize: 15, fontWeight: 700,
                    background: "#22c55e", color: "#000",
                  }}>Confirm Purchase {"\u2014"} {"\u{1FA99}"} {inspectItem.price}</button>
                ) : (
                  <button onClick={() => { if (canAfford && meetsLevel) setBuyConfirm(inspectItem.id); }} disabled={!canAfford || !meetsLevel} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    cursor: canAfford && meetsLevel ? "pointer" : "default",
                    fontSize: 15, fontWeight: 700,
                    background: canAfford && meetsLevel ? `linear-gradient(135deg, ${C.gold}, ${C.goldDark})` : C.surfaceLight,
                    color: canAfford && meetsLevel ? "#000" : C.textDim,
                    opacity: canAfford && meetsLevel ? 1 : 0.5,
                  }}>
                    {!canAfford ? `Need ${inspectItem.price - playerGold} more gold` : !meetsLevel ? `Requires Level ${inspectItem.levelReq}` : `Buy \u2014 ${"\u{1FA99}"} ${inspectItem.price}`}
                  </button>
                )}
                <button onClick={() => { setInspectItem(null); setBuyConfirm(null); }} style={{
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