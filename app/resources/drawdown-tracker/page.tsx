"use client";

import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { useState } from "react";

const FTMO_LIMITS = { daily: 5, max: 10 };

export default function DrawdownTracker() {
  const [startBalance, setStartBalance] = useState("100000");
  const [currentBalance, setCurrentBalance] = useState("100000");
  const [highWaterMark, setHighWaterMark] = useState("100000");

  const start = parseFloat(startBalance);
  const current = parseFloat(currentBalance);
  const hwm = parseFloat(highWaterMark);

  const dailyDrawdown = ((hwm - current) / hwm) * 100;
  const maxDrawdown = ((start - current) / start) * 100;

  const dailyRemaining = FTMO_LIMITS.daily - (isFinite(dailyDrawdown) ? dailyDrawdown : 0);
  const maxRemaining = FTMO_LIMITS.max - (isFinite(maxDrawdown) ? maxDrawdown : 0);

  const dailySafe = dailyDrawdown < FTMO_LIMITS.daily * 0.6;
  const dailyWarn = dailyDrawdown >= FTMO_LIMITS.daily * 0.6 && dailyDrawdown < FTMO_LIMITS.daily;
  const dailyBreached = dailyDrawdown >= FTMO_LIMITS.daily;

  const maxSafe = maxDrawdown < FTMO_LIMITS.max * 0.6;
  const maxWarn = maxDrawdown >= FTMO_LIMITS.max * 0.6 && maxDrawdown < FTMO_LIMITS.max;
  const maxBreached = maxDrawdown >= FTMO_LIMITS.max;

  const getColor = (safe: boolean, warn: boolean, breached: boolean) =>
    breached ? "#ef4444" : warn ? "#f59e0b" : safe ? "#22c55e" : "#e8eaf0";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#020305",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#e8eaf0",
    fontSize: 16,
    fontWeight: 300,
    fontFamily: "inherit",
    padding: "14px 18px",
    outline: "none",
    borderRadius: 0,
    appearance: "none",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "100px 56px 140px", position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Trading Tools
          </div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: -2, marginBottom: 16 }}>
            Drawdown Tracker
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(232,234,240,0.38)", marginBottom: 16, maxWidth: 520 }}>
            Track your daily and maximum drawdown against FTMO limits in real time.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 60, border: "1px solid rgba(255,255,255,0.06)", padding: "8px 14px" }}>
            FTMO limits: 5% daily · 10% max drawdown
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { label: "Starting Balance ($)", value: startBalance, set: setStartBalance, hint: "Your account balance at challenge start" },
                { label: "Today's Opening Balance ($)", value: highWaterMark, set: setHighWaterMark, hint: "Balance at start of today's session" },
                { label: "Current Balance ($)", value: currentBalance, set: setCurrentBalance, hint: "Your live equity right now" },
              ].map(({ label, value, set, hint }) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 10 }}>{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    min="0"
                    step="any"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(79,142,247,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
                  />
                  <div style={{ fontSize: 11, color: "rgba(232,234,240,0.18)", marginTop: 6 }}>{hint}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Daily Drawdown */}
              <div style={{ background: "#08090f", border: `1px solid ${dailyBreached ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)"}`, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${getColor(dailySafe, dailyWarn, dailyBreached)}, transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>Daily Drawdown</span>
                  <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1, color: getColor(dailySafe, dailyWarn, dailyBreached) }}>
                    {dailyBreached ? "⚠ LIMIT BREACHED" : dailyWarn ? "⚠ WARNING" : "✓ SAFE"}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 48, letterSpacing: -2, lineHeight: 1, color: getColor(dailySafe, dailyWarn, dailyBreached) }}>
                  {isFinite(dailyDrawdown) ? dailyDrawdown.toFixed(2) : "0.00"}%
                </div>
                <div style={{ fontSize: 12, color: "rgba(232,234,240,0.38)", marginTop: 6 }}>
                  {isFinite(dailyRemaining) && dailyRemaining > 0 ? `${dailyRemaining.toFixed(2)}% remaining before limit` : "Limit reached"}
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 16 }}>
                  <div style={{ height: "100%", width: `${Math.min((isFinite(dailyDrawdown) ? dailyDrawdown : 0) / FTMO_LIMITS.daily * 100, 100)}%`, background: getColor(dailySafe, dailyWarn, dailyBreached), transition: "width 0.3s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(232,234,240,0.18)" }}>0%</span>
                  <span style={{ fontSize: 10, color: "rgba(232,234,240,0.18)" }}>Limit: {FTMO_LIMITS.daily}%</span>
                </div>
              </div>

              {/* Max Drawdown */}
              <div style={{ background: "#08090f", border: `1px solid ${maxBreached ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)"}`, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${getColor(maxSafe, maxWarn, maxBreached)}, transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>Max Drawdown</span>
                  <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1, color: getColor(maxSafe, maxWarn, maxBreached) }}>
                    {maxBreached ? "⚠ LIMIT BREACHED" : maxWarn ? "⚠ WARNING" : "✓ SAFE"}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 48, letterSpacing: -2, lineHeight: 1, color: getColor(maxSafe, maxWarn, maxBreached) }}>
                  {isFinite(maxDrawdown) ? maxDrawdown.toFixed(2) : "0.00"}%
                </div>
                <div style={{ fontSize: 12, color: "rgba(232,234,240,0.38)", marginTop: 6 }}>
                  {isFinite(maxRemaining) && maxRemaining > 0 ? `${maxRemaining.toFixed(2)}% remaining before limit` : "Limit reached"}
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 16 }}>
                  <div style={{ height: "100%", width: `${Math.min((isFinite(maxDrawdown) ? maxDrawdown : 0) / FTMO_LIMITS.max * 100, 100)}%`, background: getColor(maxSafe, maxWarn, maxBreached), transition: "width 0.3s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(232,234,240,0.18)" }}>0%</span>
                  <span style={{ fontSize: 10, color: "rgba(232,234,240,0.18)" }}>Limit: {FTMO_LIMITS.max}%</span>
                </div>
              </div>

              <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>P&L</span>
                <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, color: current >= start ? "#22c55e" : "#ef4444" }}>
                  {isFinite(current - start) ? `${current >= start ? "+" : ""}$${(current - start).toFixed(2)}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 1024px) {
          section { padding: 80px 20px 100px !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
