"use client";

import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { useState } from "react";

export default function RiskRewardCalculator() {
  const [entry, setEntry] = useState("1.0850");
  const [stopLoss, setStopLoss] = useState("1.0800");
  const [takeProfit, setTakeProfit] = useState("1.0950");
  const [lotSize, setLotSize] = useState("1");
  const [pipVal, setPipVal] = useState("10");

  const risk = Math.abs(parseFloat(entry) - parseFloat(stopLoss));
  const reward = Math.abs(parseFloat(takeProfit) - parseFloat(entry));
  const rr = reward / risk;
  const pipsRisk = (risk * 10000);
  const pipsReward = (reward * 10000);
  const dollarRisk = pipsRisk * parseFloat(pipVal) * parseFloat(lotSize);
  const dollarReward = pipsReward * parseFloat(pipVal) * parseFloat(lotSize);

  const valid = isFinite(rr) && rr > 0;

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
            Risk/Reward Calculator
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(210,220,240,0.88)", marginBottom: 60, maxWidth: 520 }}>
            Calculate your R:R ratio and potential dollar profit vs. loss before entering any trade.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { label: "Entry Price", value: entry, set: setEntry, placeholder: "1.0850" },
                { label: "Stop Loss Price", value: stopLoss, set: setStopLoss, placeholder: "1.0800" },
                { label: "Take Profit Price", value: takeProfit, set: setTakeProfit, placeholder: "1.0950" },
                { label: "Lot Size", value: lotSize, set: setLotSize, placeholder: "1" },
                { label: "Pip Value ($ per lot)", value: pipVal, set: setPipVal, placeholder: "10" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 10 }}>{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    step="any"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(79,142,247,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7, transparent)" }} />
                <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", marginBottom: 20 }}>Risk/Reward Ratio</div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 64, letterSpacing: -2, lineHeight: 1, color: valid && rr >= 2 ? "#22c55e" : valid && rr >= 1 ? "#e8eaf0" : "#ef4444" }}>
                  1:{valid ? rr.toFixed(1) : "—"}
                </div>
                <div style={{ fontSize: 13, color: valid && rr >= 2 ? "#22c55e" : "rgba(210,220,240,0.88)", marginTop: 8 }}>
                  {valid && rr >= 2 ? "Good ratio — target met" : valid && rr >= 1 ? "Acceptable" : valid ? "Poor — risk exceeds reward" : "Enter valid prices"}
                </div>
              </div>

              {[
                { label: "Risk (pips)", value: isFinite(pipsRisk) ? pipsRisk.toFixed(1) : "—", color: "#ef4444" },
                { label: "Reward (pips)", value: isFinite(pipsReward) ? pipsReward.toFixed(1) : "—", color: "#22c55e" },
                { label: "Dollar Risk", value: isFinite(dollarRisk) ? `$${dollarRisk.toFixed(2)}` : "—", color: "#ef4444" },
                { label: "Dollar Profit", value: isFinite(dollarReward) ? `$${dollarReward.toFixed(2)}` : "—", color: "#22c55e" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, color }}>{value}</span>
                </div>
              ))}
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
