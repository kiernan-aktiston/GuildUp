import { useState } from 'react';
import { C } from '../constants';
import { supabase } from '../supabase';

export default function AuthScreen({ onAuth, serverError, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode); // signin, signup, forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const displayError = error || serverError;

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15,
    background: C.surfaceLight, border: `1px solid ${C.border}`,
    color: C.text, outline: "none",
  };

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Email and password required"); return; }
    if (mode === "signup" && !displayName) { setError("Display name required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await onAuth({ email, password, displayName, mode });
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    if (!email) { setError("Enter your email address first"); return; }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch (e) {
      setError(e.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD SCREEN ──
  if (mode === "forgot") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🔑</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: C.gold, letterSpacing: 1 }}>Reset Password</h2>
          <p style={{ color: C.textMuted, marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            {resetSent
              ? "Check your email for a password reset link."
              : "Enter your email and we'll send you a reset link."
            }
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.6s ease" }}>
          {!resetSent ? (
            <>
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} style={inputStyle}
                onKeyDown={e => e.key === "Enter" && handleForgotPassword()}
              />
              {displayError && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{displayError}</div>}
              <button onClick={handleForgotPassword} disabled={loading} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
                color: "#000", fontSize: 16, fontWeight: 700, opacity: loading ? 0.6 : 1,
              }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </>
          ) : (
            <div style={{
              padding: "16px 20px", borderRadius: 12, textAlign: "center",
              background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)",
            }}>
              <span style={{ fontSize: 14, color: "#22c55e", fontWeight: 600 }}>
                ✓ Reset link sent to {email}
              </span>
            </div>
          )}
          <button
            onClick={() => { setMode("signin"); setError(""); setResetSent(false); }}
            style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 14, marginTop: 8, textAlign: "center" }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── SIGN IN / SIGN UP ──
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>⚔️</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 32, color: C.gold, letterSpacing: 2 }}>GUILDUP</h1>
        <p style={{ color: C.textMuted, marginTop: 8 }}>Forge yourself. Find your guild.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.6s ease" }}>
        {mode === "signup" && (
          <input
            type="text" placeholder="Display Name" value={displayName}
            onChange={e => setDisplayName(e.target.value)} style={inputStyle}
          />
        )}
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle}
        />
        <input
          type="password" placeholder="Password (min 6 characters)" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />

        {displayError && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{displayError}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: "#000", fontSize: 16, fontWeight: 700, opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
        </button>

        {mode === "signin" && (
          <button
            onClick={() => { setMode("forgot"); setError(""); }}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, textAlign: "center" }}
          >
            Forgot your password?
          </button>
        )}

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
          style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 14, marginTop: 4, textAlign: "center" }}
        >
          {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// LANDING SCREEN
// ============================================