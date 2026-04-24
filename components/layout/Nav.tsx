import Link from "next/link";

export default function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 56px",
        height: "72px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(2,3,5,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <div
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#e8eaf0",
          }}
        >
          ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <a href="/#process" className="nav-link-item">Process</a>
        <a href="/#results" className="nav-link-item">Results</a>
        <a href="/#pricing" className="nav-link-item">Pricing</a>
        <Link href="/articles" className="nav-link-item">Articles</Link>
        <Link href="/resources" className="nav-link-item">Resources</Link>
        <a href="/#free-guide" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#4f8ef7", textDecoration: "none" }}>
          Free Guide
        </a>
        <Link href="/login" className="nav-btn-item">Login</Link>
        <a href="/#apply" className="nav-btn-apply">Apply Now</a>
      </div>

      <style>{`
        .nav-link-item {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(232,234,240,0.38);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link-item:hover { color: #e8eaf0; }
        .nav-btn-item {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(232,234,240,0.38);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-btn-item:hover { color: #e8eaf0; }
        .nav-btn-apply {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #020305;
          background: #e8eaf0;
          padding: 11px 26px;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .nav-btn-apply:hover {
          background: transparent;
          color: #e8eaf0;
          border-color: rgba(255,255,255,0.12);
        }
        @media (max-width: 1024px) {
          nav { padding: 0 20px !important; }
          .nav-link-item, .nav-btn-item { display: none; }
        }
      `}</style>
    </nav>
  );
}
