"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "invalid_link") {
        setError("That link has expired or is invalid. Please sign in below.");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    const role = data.user?.app_metadata?.role;
    router.replace(role === "admin" ? "/admin" : "/dashboard");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#020305",
    border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0",
    fontFamily: "var(--font-epilogue), Epilogue, sans-serif",
    fontSize: 14, fontWeight: 300, padding: "14px 18px",
    outline: "none", transition: "border-color 0.2s", borderRadius: 0,
  };

  return (
    <main
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "40px 20px",
        background: "#020305",
      }}
    >
      <Link href="/" style={{ textDecoration: "none", marginBottom: 48 }}>
        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: 6, textTransform: "uppercase", color: "#e8eaf0" }}>
          ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
        </div>
      </Link>

      <div
        style={{
          width: "100%", maxWidth: 420, background: "#08090f",
          border: "1px solid rgba(255,255,255,0.12)", padding: "52px 48px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />

        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 24 }}>Client Portal</div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, marginBottom: 32 }}>Sign In</h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 10 }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 10 }}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#f87171" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            <span>{loading ? "Signing in…" : "Sign In →"}</span>
          </button>
        </form>
      </div>

      <Link href="/" style={{ marginTop: 32, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", textDecoration: "none" }}>
        ← Back to site
      </Link>

      <style>{`
        .login-btn {
          width: 100%; background: #e8eaf0; color: #020305;
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 700; font-size: 12px; letter-spacing: 3px;
          text-transform: uppercase; padding: 18px;
          border: none; cursor: pointer; transition: all 0.25s;
          position: relative; overflow: hidden; border-radius: 0;
        }
        .login-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .login-btn:hover::after { transform: translateX(0); }
        .login-btn span { position: relative; z-index: 1; color: #020305; }
        .login-btn:hover span { color: #e8eaf0; }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </main>
  );
}
