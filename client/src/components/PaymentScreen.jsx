import { useState, useEffect } from 'react';
import { C, CLASSES } from '../constants';
import { supabase } from '../supabase';

const MONO = "'Courier New', 'Consolas', monospace";
const SUPABASE_URL = 'https://emdodkszhwulhcjebdqq.supabase.co';

export default function PaymentScreen({ playerClass = "warrior", playerLevel = 1, playerName = "Contractor", userId, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const cls = CLASSES[playerClass] || CLASSES.warrior;

  // Check if payment was completed (handles webhook race condition)
  const checkPaymentStatus = async (retries = 5) => {
    setChecking(true);
    setError("");
    for (let i = 0; i < retries; i++) {
      try {
        const { data } = await supabase.from("profiles").select("is_paid").eq("id", userId).single();
        if (data?.is_paid) {
          onPaid?.();
          return;
        }
      } catch (e) { /* ignore */ }
      if (i < retries - 1) await new Promise(r => setTimeout(r, 2000));
    }
    setChecking(false);
    setError("Payment not yet confirmed. Try again in a moment.");
  };

  // Auto-check on mount if returning from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState(null, "", window.location.pathname);
      checkPaymentStatus(6);
    }
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session.");
      }
    } catch (e) {
      setError("Connection failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 28px", background: "#050505", position: "relative",
    }}>
      {/* Faint sigil watermark */}
      <img src="/guildup-sigil.png" alt="" style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 180, opacity: 0.04, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360, width: "100%" }}>

        {/* Header */}
        <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold, letterSpacing: 3, marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>
          The Compact {"\u2014"} Activation
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: 2, marginBottom: 32 }}>
          Welcome, {playerName}
        </div>

        {/* Summary card */}
        <div style={{
          background: "rgba(0,0,0,0.6)", border: `1px solid ${C.gold}22`,
          padding: "24px 20px", marginBottom: 28,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{cls.emoji}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            Level {playerLevel} {cls.title}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, lineHeight: 1.8, marginTop: 12 }}>
            Your class has been assigned.{"\n"}
            Your starting level has been calibrated.{"\n"}
            One step remains.
          </div>
        </div>

        {/* Value prop */}
        <div style={{
          background: "rgba(0,0,0,0.6)", border: `1px solid ${C.gold}22`,
          padding: "20px", marginBottom: 28, textAlign: "left",
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 14, textTransform: "uppercase", fontWeight: 700 }}>
            Operational Access Includes
          </div>
          {[
            "5 daily protocols with guided mentors",
            "Equipment system with weekly rotating stock",
            "Guild system \u2014 5-person squads",
            "Contract missions with your guildmates",
            "XP, leveling, and class progression",
            "All future updates and expansions",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ color: C.gold, fontFamily: MONO, fontSize: 12, flexShrink: 0 }}>{"\u2713"}</span>
              <span style={{ fontSize: 13, color: "#ddd", lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            $5.99
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted }}>
            monthly {"\u00B7"} cancel anytime
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: "100%", padding: "16px", border: `1px solid ${C.gold}`,
            cursor: loading ? "default" : "pointer",
            background: loading ? "transparent" : C.goldFaint,
            fontFamily: MONO, color: C.gold, fontSize: 15, fontWeight: 700,
            letterSpacing: 2, borderRadius: 0, textTransform: "uppercase",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "[ CONNECTING... ]" : "[ ACTIVATE CONTRACT ]"}
        </button>

        {error && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: "#ef4444", marginTop: 12 }}>{error}</div>
        )}

        {/* Check payment status button — for users returning from Stripe */}
        <button
          onClick={checkPaymentStatus}
          disabled={checking}
          style={{
            width: "100%", padding: "12px", marginTop: 12,
            border: `1px solid ${C.border}`, cursor: checking ? "default" : "pointer",
            background: "transparent", fontFamily: MONO, color: C.textDim,
            fontSize: 12, borderRadius: 0, opacity: checking ? 0.5 : 1,
          }}
        >
          {checking ? "[ CHECKING... ]" : "[ ALREADY PAID? CHECK STATUS ]"}
        </button>

        <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, marginTop: 16, lineHeight: 1.8 }}>
          Secure payment via Stripe.{"\n"}Cancel anytime from your Stripe portal.
        </div>
      </div>
    </div>
  );
}