import { useState } from 'react';
import { C } from '../constants';
import { supabase } from '../supabase';

export default function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
    background: C.surfaceLight, border: `1px solid ${C.border}`,
    color: C.text, outline: "none",
  };

  const handleReset = async () => {
    setError("");
    if (!password || !confirm) { setError("Both fields are required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => onDone(), 2000);
    } catch (e) {
      setError(e.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🔑</div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: C.gold, letterSpacing: 1 }}>
          Set New Password
        </h2>
        <p style={{ color: C.textMuted, marginTop: 8, fontSize: 14 }}>
          Choose a new password for your account.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.6s ease" }}>
        {success ? (
          <div style={{
            padding: "20px", borderRadius: 12, textAlign: "center",
            background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <span style={{ fontSize: 15, color: "#22c55e", fontWeight: 600 }}>
              Password updated! Redirecting...
            </span>
          </div>
        ) : (
          <>
            <input
              type="password" placeholder="New password (min 6 characters)"
              value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password" placeholder="Confirm new password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              style={inputStyle}
              onKeyDown={e => e.key === "Enter" && handleReset()}
            />
            {error && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{error}</div>}
            <button onClick={handleReset} disabled={loading} style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              color: "#000", fontSize: 16, fontWeight: 700, opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
