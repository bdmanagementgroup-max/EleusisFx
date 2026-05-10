"use client";

import { useState } from "react";

const BTC_ADDRESS = "31rnfH94AKsua2igqDGrEUbYSRsc3m7sAG";

export default function CryptoPayment() {
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    navigator.clipboard.writeText(BTC_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* BTC Address Block */}
      <div
        style={{
          background: "rgba(79,142,247,0.06)",
          border: "1px solid rgba(79,142,247,0.25)",
          borderRadius: 6,
          padding: "16px 20px",
        }}
      >
        <div style={{ fontSize: 11, color: "#7eb3ff", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Bitcoin (BTC) — Bitcoin Network Only
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: "rgba(210,220,240,0.95)",
            wordBreak: "break-all",
            lineHeight: 1.6,
            marginBottom: 14,
          }}
        >
          {BTC_ADDRESS}
        </div>
        <button
          onClick={copyAddress}
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(79,142,247,0.15)",
            border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(79,142,247,0.4)"}`,
            borderRadius: 4,
            padding: "8px 20px",
            color: copied ? "#22c55e" : "#4f8ef7",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
            width: "100%",
          }}
        >
          {copied ? "Copied!" : "Copy Address"}
        </button>
      </div>

      {/* Instructions */}
      <div
        style={{
          background: "rgba(255,200,60,0.04)",
          border: "1px solid rgba(255,200,60,0.15)",
          borderRadius: 6,
          padding: "14px 18px",
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(255,200,60,0.85)", lineHeight: 1.7, margin: 0 }}>
          <strong>How to subscribe:</strong> Send £79 equivalent in BTC to the address above (Bitcoin network only), then message us on{" "}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7eb3ff", textDecoration: "underline" }}
          >
            WhatsApp
          </a>{" "}
          with your transaction ID to confirm access.
        </p>
      </div>
    </div>
  );
}
