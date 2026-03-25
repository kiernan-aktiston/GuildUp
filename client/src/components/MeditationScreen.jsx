import { useState } from "react";
import { C } from "../constants";
import { ITEMS, RARITIES, SLOTS, RANKS } from "../equipmentData";

// ═══════════════════════════════════════
// 20 MEDITATION PROMPTS
// ═══════════════════════════════════════
export const MEDITATION_PROMPTS = [
  { id: "war-plan", title: "The War Plan", prompt: "Name one objective for today. Write three moves to take it.", minChars: 100, emoji: "⚔️" },
  { id: "mirror", title: "The Man in the Mirror", prompt: "Five years from now, who are you? Describe him. Be specific.", minChars: 200, emoji: "🪞" },
  { id: "weapons", title: "Count Your Weapons", prompt: "Write three things in your life right now that you'd fight to keep.", minChars: 75, emoji: "🛡️" },
  { id: "chain", title: "Forging a Chain", prompt: "Name one habit you're building. Why does it matter? What happens if you never build it?", minChars: 100, emoji: "🔗" },
  { id: "beast", title: "Face the Beast", prompt: "What challenge is hunting you right now? Write one way to turn and face it.", minChars: 100, emoji: "🐺" },
  { id: "edge", title: "Sharpened Edge", prompt: "What did you learn recently that changed how you see the world?", minChars: 75, emoji: "🗡️" },
  { id: "mentor", title: "The Mentor's Shadow", prompt: "Name someone you respect. What quality of theirs do you lack? How do you build it?", minChars: 100, emoji: "🦉" },
  { id: "letter", title: "Letter to the Future", prompt: "Write a message to yourself one year from now. What will you have done?", minChars: 150, emoji: "📜" },
  { id: "running", title: "The Thing You're Running From", prompt: "What are you avoiding? Name it. Why are you afraid of it?", minChars: 75, emoji: "👁️" },
  { id: "bond", title: "Strengthen the Bond", prompt: "Name one relationship that's weakening. What's one action you'll take to repair it?", minChars: 75, emoji: "🤝" },
  { id: "debt", title: "The Debt", prompt: "Who gave you something you haven't repaid — time, trust, patience? What do you owe them?", minChars: 75, emoji: "⚖️" },
  { id: "standard", title: "The Standard", prompt: "What is one rule you hold yourself to that most people don't? Why?", minChars: 100, emoji: "🏴" },
  { id: "excuse", title: "Kill the Excuse", prompt: "Name the excuse you use most often. Now dismantle it. Why is it a lie?", minChars: 100, emoji: "💀" },
  { id: "gravestone", title: "The Gravestone", prompt: "If you died today, what would people say about you? What do you want them to say instead?", minChars: 150, emoji: "🪦" },
  { id: "iron", title: "Blood and Iron", prompt: "What's one thing you did this week that was hard? Why did it matter?", minChars: 75, emoji: "🩸" },
  { id: "weak", title: "The Weak Point", prompt: "Where are you weakest right now — body, mind, spirit, or relationships? What's one thing you can do about it today?", minChars: 100, emoji: "🎯" },
  { id: "oath", title: "The Oath", prompt: "Make a promise to yourself. Something specific, something you can do this week. Write it like you mean it.", minChars: 100, emoji: "🔥" },
  { id: "inventory", title: "Silent Inventory", prompt: "List five skills you have. Now list five you need. What's the gap?", minChars: 100, emoji: "📋" },
  { id: "weight", title: "The Weight You Carry", prompt: "What's one thing you need to let go of — a grudge, a fear, a bad habit? Why are you still holding it?", minChars: 100, emoji: "⛓️" },
  { id: "principles", title: "First Principles", prompt: "What do you actually believe in? Not what you were told to believe. What have you tested and found true?", minChars: 150, emoji: "🏛️" },
];

// Get today's meditation (deterministic per day + userId)
export function getTodayMeditation(dateStr, userId = "") {
  const seed = (dateStr + userId).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MEDITATION_PROMPTS[seed % MEDITATION_PROMPTS.length];
}

// Roll a chest reward (double rare/epic chance vs store)
function rollMeditationChest(playerLevel, ownedIds = []) {
  const relevantRanks = RANKS.filter(r => r.level <= playerLevel + 5);
  const rank = relevantRanks[Math.floor(Math.random() * relevantRanks.length)] || RANKS[0];

  // Double chance: 40% common, 40% rare, 20% epic
  const roll = Math.random();
  const rarity = roll < 0.4 ? "common" : roll < 0.8 ? "rare" : "epic";

  let candidates = ITEMS.filter(i =>
    i.levelReq === rank.level && i.rarity === rarity && !ownedIds.includes(i.id)
  );
  if (candidates.length === 0) {
    candidates = ITEMS.filter(i => i.rarity === rarity && !ownedIds.includes(i.id));
  }
  if (candidates.length === 0) {
    candidates = ITEMS.filter(i => !ownedIds.includes(i.id));
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function MeditationScreen({ meditation, onBack, onComplete, playerLevel = 1, inventory = [] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [step, setStep] = useState("write"); // write, chest, reveal
  const [chestItem, setChestItem] = useState(null);

  const meetsMin = body.length >= meditation.minChars;
  const hasTitle = title.trim().length > 0;
  const canSubmit = meetsMin && hasTitle;

  const handleSubmit = () => {
    const item = rollMeditationChest(playerLevel, inventory);
    setChestItem(item);
    setStep("chest");
    // Brief delay for chest animation
    setTimeout(() => setStep("reveal"), 1000);
  };

  // ── WRITE SCREEN ──
  if (step === "write") {
    return (
      <div dir="ltr" style={{ minHeight: "100vh", padding: "24px 20px 120px", animation: "fadeIn 0.3s ease", position: "relative" }}>
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, height: "100vh",
          backgroundImage: "url(/quest-map.png)", backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.5, pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => onBack()} style={{
            background: "none", border: "none", color: "#8b7355", fontSize: 14,
            cursor: "pointer", marginBottom: 16, padding: 0,
          }}>← Back</button>

          {/* Meditation header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{meditation.emoji}</div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700,
              color: "#3d2b1f", marginBottom: 4,
            }}>{meditation.title}</div>
            <div style={{
              fontSize: 11, color: "#8b7355", fontWeight: 700, letterSpacing: 2,
              textTransform: "uppercase",
            }}>Daily Meditation</div>
          </div>

          {/* Prompt */}
          <div style={{
            padding: "16px 18px", borderRadius: 14, marginBottom: 20,
            background: "rgba(60, 40, 20, 0.7)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(90, 60, 30, 0.5)",
          }}>
            <p style={{ fontSize: 15, color: "#f5e6d0", lineHeight: 1.8, fontStyle: "italic", margin: 0 }}>
              "{meditation.prompt}"
            </p>
          </div>

          {/* Title input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#8b7355", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
              Title Your Meditation
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give it a name..."
              maxLength={80}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
                background: "rgba(210, 180, 140, 0.4)", border: "1px solid rgba(160, 120, 70, 0.4)",
                color: "#3d2b1f", outline: "none", fontWeight: 600,
                fontFamily: "'Cinzel', serif",
              }}
            />
          </div>

          {/* Body textarea */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: "#8b7355", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Your Response
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                color: meetsMin ? "#2d6a30" : "#8b7355",
              }}>
                {body.length} / {meditation.minChars} min
              </div>
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write here..."
              rows={8}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
                background: "rgba(210, 180, 140, 0.4)", border: "1px solid rgba(160, 120, 70, 0.4)",
                color: "#3d2b1f", outline: "none", resize: "vertical",
                lineHeight: 1.7, minHeight: 180,
              }}
            />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!canSubmit} style={{
            width: "100%", padding: "16px", borderRadius: 12, border: "none",
            cursor: canSubmit ? "pointer" : "default", fontSize: 15, fontWeight: 700,
            background: canSubmit ? "linear-gradient(135deg, #2d6a30, #1a5c1e)" : "rgba(139, 108, 66, 0.3)",
            color: canSubmit ? "#fff" : "#8b7355",
            opacity: canSubmit ? 1 : 0.6,
            boxShadow: canSubmit ? "0 2px 12px rgba(45, 106, 48, 0.4)" : "none",
          }}>
            {!hasTitle ? "Title your meditation first" : !meetsMin ? `${meditation.minChars - body.length} more characters needed` : "Submit Meditation"}
          </button>

          {/* Chest reward teaser */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontSize: 11, color: "#8b7355", fontStyle: "italic" }}>
              ✨ Completing this awards a chest with double rare/epic chance
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CHEST OPENING ──
  if (step === "chest") {
    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.9)", position: "relative",
      }}>
        <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 80, marginBottom: 16, animation: "pulse 0.6s ease infinite" }}>✨</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>Opening your reward...</div>
        </div>
      </div>
    );
  }

  // ── REVEAL ──
  if (step === "reveal") {
    if (!chestItem) {
      return (
        <div dir="ltr" style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 24px", background: "rgba(0,0,0,0.9)",
        }}>
          <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📜</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gold, marginBottom: 8 }}>Meditation Complete</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>You've claimed all available equipment. The meditation itself is the reward.</div>
            <button onClick={() => onComplete(title, null)} style={{
              padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #2d6a30, #1a5c1e)",
              color: "#fff", fontSize: 16, fontWeight: 700,
            }}>Return</button>
          </div>
        </div>
      );
    }

    const rarity = RARITIES[chestItem.rarity];
    const slot = SLOTS[chestItem.slot];
    return (
      <div dir="ltr" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", background: "rgba(0,0,0,0.9)",
      }}>
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease", maxWidth: 320 }}>
          <div style={{ fontSize: 14, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Meditation Complete — You received</div>
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: "0 auto 16px",
            background: rarity.bgColor, border: `3px solid ${rarity.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, boxShadow: `0 0 30px ${rarity.color}44`,
          }}>{slot.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: rarity.color, marginBottom: 4 }}>{chestItem.name}</div>
          <div style={{
            fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1,
            textTransform: "uppercase", marginBottom: 8,
          }}>{rarity.label} {slot.label}</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16, lineHeight: 1.5 }}>{chestItem.desc}</div>
          <div style={{
            padding: "10px", borderRadius: 10, background: C.surfaceLight,
            marginBottom: 24, display: "inline-flex", gap: 8,
          }}>
            {Object.entries(chestItem.stats).map(([stat, val]) => (
              <div key={stat} style={{
                padding: "4px 8px", borderRadius: 6,
                background: val > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: val > 0 ? "#22c55e" : "#ef4444" }}>{val > 0 ? "+" : ""}{val}</div>
                <div style={{ fontSize: 8, color: C.textDim, textTransform: "uppercase" }}>{stat}</div>
              </div>
            ))}
          </div>
          <div>
            <button onClick={() => onComplete(title, chestItem)} style={{
              padding: "16px 48px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${rarity.color}, ${rarity.color}cc)`,
              color: "#000", fontSize: 15, fontWeight: 700,
            }}>Claim</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
