import { useState } from "react";
import { C } from "../constants";
import { RARITIES, SLOTS } from "../equipmentData";
import { CHEST_TYPES, rollChest } from "../chestSystem";

export const MEDITATION_PROMPTS = [
  { id: "war-plan", title: "The War Plan", prompt: "Name one objective for today. Write three moves to take it.", minChars: 100, emoji: "\u2694\uFE0F" },
  { id: "mirror", title: "The Man in the Mirror", prompt: "Five years from now, who are you? Describe him. Be specific.", minChars: 200, emoji: "\u{1FA9E}" },
  { id: "weapons", title: "Count Your Weapons", prompt: "Write three things in your life right now that you'd fight to keep.", minChars: 75, emoji: "\u{1F6E1}\uFE0F" },
  { id: "chain", title: "Forging a Chain", prompt: "Name one habit you're building. Why does it matter? What happens if you never build it?", minChars: 100, emoji: "\u{1F517}" },
  { id: "beast", title: "Face the Beast", prompt: "What challenge is hunting you right now? Write one way to turn and face it.", minChars: 100, emoji: "\u{1F43A}" },
  { id: "edge", title: "Sharpened Edge", prompt: "What did you learn recently that changed how you see the world?", minChars: 75, emoji: "\u{1F5E1}\uFE0F" },
  { id: "mentor", title: "The Mentor's Shadow", prompt: "Name someone you respect. What quality of theirs do you lack? How do you build it?", minChars: 100, emoji: "\u{1F989}" },
  { id: "letter", title: "Letter to the Future", prompt: "Write a message to yourself one year from now. What will you have done?", minChars: 150, emoji: "\u{1F4DC}" },
  { id: "running", title: "The Thing You're Running From", prompt: "What are you avoiding? Name it. Why are you afraid of it?", minChars: 75, emoji: "\u{1F441}\uFE0F" },
  { id: "bond", title: "Strengthen the Bond", prompt: "Name one relationship that's weakening. What's one action you'll take to repair it?", minChars: 75, emoji: "\u{1F91D}" },
  { id: "debt", title: "The Debt", prompt: "Who gave you something you haven't repaid \u2014 time, trust, patience? What do you owe them?", minChars: 75, emoji: "\u2696\uFE0F" },
  { id: "standard", title: "The Standard", prompt: "What is one rule you hold yourself to that most people don't? Why?", minChars: 100, emoji: "\u{1F3F4}" },
  { id: "excuse", title: "Kill the Excuse", prompt: "Name the excuse you use most often. Now dismantle it. Why is it a lie?", minChars: 100, emoji: "\u{1F480}" },
  { id: "gravestone", title: "The Gravestone", prompt: "If you died today, what would people say about you? What do you want them to say instead?", minChars: 150, emoji: "\u{1FAA6}" },
  { id: "iron", title: "Blood and Iron", prompt: "What's one thing you did this week that was hard? Why did it matter?", minChars: 75, emoji: "\u{1FA78}" },
  { id: "weak", title: "The Weak Point", prompt: "Where are you weakest right now \u2014 body, mind, spirit, or relationships? What's one thing you can do about it today?", minChars: 100, emoji: "\u{1F3AF}" },
  { id: "oath", title: "The Oath", prompt: "Make a promise to yourself. Something specific, something you can do this week. Write it like you mean it.", minChars: 100, emoji: "\u{1F525}" },
  { id: "inventory", title: "Silent Inventory", prompt: "List five skills you have. Now list five you need. What's the gap?", minChars: 100, emoji: "\u{1F4CB}" },
  { id: "weight", title: "The Weight You Carry", prompt: "What's one thing you need to let go of \u2014 a grudge, a fear, a bad habit? Why are you still holding it?", minChars: 100, emoji: "\u26D3\uFE0F" },
  { id: "principles", title: "First Principles", prompt: "What do you actually believe in? Not what you were told to believe. What have you tested and found true?", minChars: 150, emoji: "\u{1F3DB}\uFE0F" },
];

export function getTodayMeditation(dateStr, userId = "") {
  const seed = (dateStr + userId).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MEDITATION_PROMPTS[seed % MEDITATION_PROMPTS.length];
}

export default function MeditationScreen({ meditation, onBack, onComplete, playerLevel = 1, inventory = [] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [step, setStep] = useState("write");
  const [chestResult, setChestResult] = useState(null);

  const meetsMin = body.length >= meditation.minChars;
  const hasTitle = title.trim().length > 0;
  const canSubmit = meetsMin && hasTitle;

  const handleSubmit = () => {
    const result = rollChest(CHEST_TYPES.meditation, playerLevel, inventory);
    setChestResult(result);
    setStep("chest");
    setTimeout(() => setStep("reveal"), 1000);
  };

  if (step === "write") {
    return (
      <div style={{ minHeight: "100vh", padding: "24px 20px 120px", background: C.bg, animation: "fadeIn 0.3s ease" }}>
        <button onClick={() => onBack()} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}>{"\u2190"} Back</button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{meditation.emoji}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: 1 }}>{meditation.title}</div>
          <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>Daily Meditation</div>
        </div>

        <div style={{ padding: "16px 18px", borderRadius: 12, marginBottom: 24, background: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, fontStyle: "italic", margin: 0 }}>"{meditation.prompt}"</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Title Your Meditation</div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Give it a name..." maxLength={80} style={{
            width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.text, outline: "none", fontWeight: 600,
          }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Your Response</div>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: meetsMin ? C.green : C.textDim }}>{body.length} / {meditation.minChars} min</div>
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write here..." rows={8} style={{
            width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.text, outline: "none", resize: "vertical", lineHeight: 1.7, minHeight: 180,
          }} />
        </div>

        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          width: "100%", padding: "16px", borderRadius: 20, border: "none",
          cursor: canSubmit ? "pointer" : "default", fontSize: 15, fontWeight: 600,
          background: canSubmit ? C.blue : C.surfaceLight,
          color: canSubmit ? "#fff" : C.textDim, opacity: canSubmit ? 1 : 0.6,
        }}>
          {!hasTitle ? "Title your meditation first" : !meetsMin ? `${meditation.minChars - body.length} more characters needed` : "Submit Meditation"}
        </button>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontSize: 11, color: C.textDim, fontStyle: "italic" }}>Awards gold + chance for equipment</div>
        </div>
      </div>
    );
  }

  if (step === "chest") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.95)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16, animation: "pulse 0.6s ease infinite" }}>{"\u{1F4DC}"}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.blue }}>Opening your reward...</div>
        </div>
      </div>
    );
  }

  if (step === "reveal" && chestResult) {
    const hasItem = !!chestResult.item;
    const rarity = hasItem ? RARITIES[chestResult.item.rarity] : null;
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "rgba(0,0,0,0.95)" }}>
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease", maxWidth: 320 }}>
          <div style={{ fontSize: 14, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Meditation Complete</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.gold, marginBottom: 8 }}>{"\u{1FA99}"} +{chestResult.gold}</div>
          {hasItem ? (
            <>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>and an item...</div>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{SLOTS[chestResult.item.slot].emoji}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: rarity.color, marginBottom: 4 }}>{chestResult.item.name}</div>
              <div style={{ fontSize: 11, color: rarity.color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>{rarity.label} {SLOTS[chestResult.item.slot].label}</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, marginTop: 8 }}>No item this time. The gold is yours.</div>
          )}
          <button onClick={() => onComplete(title, chestResult)} style={{
            padding: "14px 48px", borderRadius: 20, border: "none", cursor: "pointer",
            background: hasItem ? rarity.color : C.gold, color: "#000", fontSize: 15, fontWeight: 600,
          }}>Claim</button>
        </div>
      </div>
    );
  }

  return null;
}