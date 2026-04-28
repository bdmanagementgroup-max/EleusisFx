"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Handles implicit flow — fires when Supabase detects the recovery token in the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    // Handle page reload — session already exists
    void supabase.auth.getSession().then((res: { data: { session: unknown } }) => {
      if (res.data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 2000);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#020305",
    border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0",
    fontFamily: "var(--font-epilogue), Epilogue, sans-serif",
    fontSize: 14, fontWeight: 300, padding: "14px 18px",
    outline: "none", transition: "border-color 0.2s", borderRadius: 0,
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: "#020305" }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 48 }}>
        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: 6, textTransform: "uppercase", color: "#e8eaf0" }}>
          ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
        </div>
      </Link>

      <div style={{ width: "100%", maxWidth: 420, background: "#08090f", border: "1px solid rgba(255,255,255,0.12)", padding: "52px 48px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />

        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 24 }}>Client Portal</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, marginBottom: 8 }}>
          Set Your Password
        </h1>
        <p style={{ fontSize: 13, color: "rgba(210,220,240,0.58)", marginBottom: 32, lineHeight: 1.6 }}>
          Choose a password for your Eleusis FX dashboard.
        </p>

        {done ? (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", padding: "16px 20px", fontSize: 13, color: "#22c55e", lineHeight: 1.6 }}>
            Password set. Redirecting to your dashboard…
          </div>
        ) : !ready ? (
          <div style={{ fontSize: 13, color: "rgba(210,220,240,0.4)", textAlign: "center", padding: "24px 0" }}>
            Verifying link…
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 10 }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 10 }}>
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="reset-btn">
              <span>{loading ? "Saving…" : "Set Password →"}</span>
            </button>
          </form>
        )}
      </div>

      <Link href="/login" style={{ marginTop: 32, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", textDecoration: "none" }}>
        ← Back to login
      </Link>

      <style>{`
        .reset-btn {
          width: 100%; background: #e8eaf0; color: #020305;
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 700; font-size: 12px; letter-spacing: 3px;
          text-transform: uppercase; padding: 18px;
          border: none; cursor: pointer; transition: all 0.25s;
          position: relative; overflow: hidden; border-radius: 0;
        }
        .reset-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .reset-btn:hover::after { transform: translateX(0); }
        .reset-btn span { position: relative; z-index: 1; color: #020305; }
        .reset-btn:hover span { color: #e8eaf0; }
        .reset-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </main>
  );
}
