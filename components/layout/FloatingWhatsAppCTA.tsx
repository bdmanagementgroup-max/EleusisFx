"use client";

import { useState } from "react";

export default function FloatingWhatsAppCTA() {
  const [isVisible, setIsVisible] = useState(true);
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER;

  if (!waNumber || !isVisible) return null;

  const waLink = `https://wa.me/${waNumber.replace(/\D/g, "")}?text=Hi%20Eleusis%20FX%2C%20I%27m%20interested%20in%20the%20evaluation%20pass.`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px",
        background: "linear-gradient(180deg, rgba(2,3,5,0) 0%, rgba(2,3,5,0.98) 100%)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", margin: 0 }}>Questions? Chat with us on WhatsApp</p>
      </div>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "10px 20px",
          background: "#25D366",
          color: "white",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 4,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Chat Now
      </a>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          background: "none",
          border: "none",
          color: "rgba(210,220,240,0.6)",
          cursor: "pointer",
          fontSize: 18,
          padding: "4px 8px",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
