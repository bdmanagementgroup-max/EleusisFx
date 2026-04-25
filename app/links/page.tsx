import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eleusis FX — Links",
  description: "Eleusis FX — Prop Firm Specialists. Get funded with a $100K account.",
};

export default function LinksPage() {
  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          background: "#020305",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        {/* Social proof bar */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginBottom: 48,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["700+ Clients", "Est. 2019", "UK Based"].map((item) => (
            <div
              key={item}
              style={{
                fontSize: 10,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(232,234,240,0.38)",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Logo */}
        <div
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#e8eaf0",
            marginBottom: 12,
          }}
        >
          ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
        </div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(232,234,240,0.38)",
            marginBottom: 52,
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          Prop Firm Specialists — UK Based
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 400 }}>
          {[
            { href: "/#free-guide", label: "Get Free Guide — 5 Fatal Mistakes", accent: true },
            { href: "/#apply", label: "Apply for a Funded Account", accent: false },
            { href: "/articles", label: "Read Our Articles", accent: false },
            { href: "https://instagram.com/eleusisfx", label: "Follow on Instagram", accent: false, external: true },
          ].map(({ href, label, accent, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              style={{
                display: "block",
                textAlign: "center",
                padding: "18px 24px",
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.2s",
                border: accent ? "none" : "1px solid rgba(255,255,255,0.12)",
                background: accent ? "#4f8ef7" : "transparent",
                color: accent ? "#020305" : "#e8eaf0",
                borderRadius: 0,
              }}
            >
              {label}
            </a>
          ))}
        </div>

        <p
          style={{
            marginTop: 48,
            fontSize: 11,
            color: "rgba(232,234,240,0.18)",
            letterSpacing: 1,
          }}
        >
          © {new Date().getFullYear()} Eleusis FX
        </p>
      </main>
    </>
  );
}
