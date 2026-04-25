"use client";

import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import type { Metadata } from "next";

export default function PositionSizeCalculator() {
  const [balance, setBalance] = useState("10000");
  const [risk, setRisk] = useState("1");
  const [stopLoss, setStopLoss] = useState("20");
  const [pipValue, setPipValue] = useState("10");

  const riskAmount = (parseFloat(balance) * parseFloat(risk)) / 100;
  const lots = riskAmount / (parseFloat(stopLoss) * parseFloat(pipValue));
  const validLots = isFinite(lots) && lots > 0 ? lots : 0;

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
            Position Size Calculator
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(232,234,240,0.38)", marginBottom: 60, maxWidth: 520 }}>
            Calculate your exact lot size based on account balance, risk percentage, and stop loss distance.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            {/* Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { label: "Account Balance ($)", value: balance, set: setBalance, placeholder: "10000" },
                { label: "Risk Per Trade (%)", value: risk, set: setRisk, placeholder: "1" },
                { label: "Stop Loss (pips)", value: stopLoss, set: setStopLoss, placeholder: "20" },
                { label: "Pip Value ($ per lot)", value: pipValue, set: setPipValue, placeholder: "10" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 10 }}>{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    min="0"
                    step="any"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(79,142,247,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
                  />
                </div>
              ))}
            </div>

            {/* Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7, transparent)" }} />
                <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", marginBottom: 20 }}>Position Size</div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 64, letterSpacing: -2, lineHeight: 1, color: "#4f8ef7" }}>
                  {validLots.toFixed(2)}
                </div>
                <div style={{ fontSize: 13, color: "rgba(232,234,240,0.38)", marginTop: 8 }}>lots</div>
              </div>

              {[
                { label: "Amount at Risk", value: `$${isFinite(riskAmount) ? riskAmount.toFixed(2) : "0.00"}`, color: "#ef4444" },
                { label: "Mini Lots", value: isFinite(validLots) ? (validLots * 10).toFixed(1) : "0.0", color: "#e8eaf0" },
                { label: "Micro Lots", value: isFinite(validLots) ? (validLots * 100).toFixed(0) : "0", color: "#e8eaf0" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 20, color }}>{value}</span>
                </div>
              ))}

              <p style={{ fontSize: 11, color: "rgba(232,234,240,0.18)", lineHeight: 1.7, marginTop: 8 }}>
                Pip value varies by currency pair. For EUR/USD standard lots, pip value ≈ $10. Always verify with your broker.
              </p>
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
