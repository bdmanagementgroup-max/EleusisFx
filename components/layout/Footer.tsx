import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "40px 56px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-syne), Syne, sans-serif",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: "rgba(210,220,240,0.88)",
        }}
      >
        ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
      </div>

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        {[
          { href: "https://instagram.com/eleusisfx", label: "Instagram", external: true },
          { href: "/#process", label: "Process" },
          { href: "/#results", label: "Results" },
          { href: "/#pricing", label: "Pricing" },
          { href: "/#apply", label: "Apply" },
          { href: "/articles", label: "Articles" },
          { href: "/resources", label: "Resources" },
        ].map(({ href, label, external }) => (
          <a
            key={label}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="footer-link"
          >
            {label}
          </a>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "rgba(210,220,240,0.58)" }}>
        © {new Date().getFullYear()} Eleusis FX. All rights reserved.
      </p>

      <style>{`
        .footer-link {
          font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(210,220,240,0.58); text-decoration: none; transition: color 0.2s;
        }
        .footer-link:hover { color: #e8eaf0; }
        @media (max-width: 1024px) {
          footer { padding: 28px 20px !important; flex-direction: column; text-align: center; }
        }
      `}</style>
    </footer>
  );
}
