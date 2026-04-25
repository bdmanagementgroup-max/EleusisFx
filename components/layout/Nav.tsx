"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
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

        {/* Desktop links */}
        <div className="nav-desktop">
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

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none" }}
        >
          <div style={{ width: 22, height: 1.5, background: "#e8eaf0", marginBottom: 5, transition: "all 0.2s", transform: open ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <div style={{ width: 22, height: 1.5, background: "#e8eaf0", marginBottom: 5, transition: "all 0.2s", opacity: open ? 0 : 1 }} />
          <div style={{ width: 22, height: 1.5, background: "#e8eaf0", transition: "all 0.2s", transform: open ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(2,3,5,0.98)",
            backdropFilter: "blur(20px)",
            zIndex: 499,
            display: "flex",
            flexDirection: "column",
            padding: "40px 28px",
            gap: 0,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { href: "/#process", label: "Process" },
            { href: "/#results", label: "Results" },
            { href: "/#pricing", label: "Pricing" },
            { href: "/articles", label: "Articles" },
            { href: "/resources", label: "Resources" },
            { href: "/#free-guide", label: "Free Guide" },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: -0.5,
                color: "rgba(232,234,240,0.6)",
                textDecoration: "none",
                padding: "18px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                transition: "color 0.2s",
              }}
            >
              {label}
            </a>
          ))}
          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={{
                flex: 1, textAlign: "center",
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 600, fontSize: 11, letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(232,234,240,0.38)",
                textDecoration: "none", padding: "14px",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "color 0.2s",
              }}
            >
              Login
            </Link>
            <a
              href="/#apply"
              onClick={() => setOpen(false)}
              style={{
                flex: 1, textAlign: "center",
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 700, fontSize: 11, letterSpacing: 2,
                textTransform: "uppercase", color: "#020305",
                background: "#e8eaf0", padding: "14px",
                textDecoration: "none",
              }}
            >
              Apply Now
            </a>
          </div>
        </div>
      )}

      <style>{`
        .nav-link-item {
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(232,234,240,0.38); text-decoration: none; transition: color 0.2s;
        }
        .nav-link-item:hover { color: #e8eaf0; }
        .nav-btn-item {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: rgba(232,234,240,0.38);
          text-decoration: none; transition: color 0.2s;
        }
        .nav-btn-item:hover { color: #e8eaf0; }
        .nav-btn-apply {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: #020305; background: #e8eaf0;
          padding: 11px 26px; text-decoration: none; transition: all 0.2s;
          border: 1px solid transparent;
        }
        .nav-btn-apply:hover { background: transparent; color: #e8eaf0; border-color: rgba(255,255,255,0.12); }
        .nav-desktop {
          display: flex; align-items: center; gap: 40;
        }
        @media (max-width: 1024px) {
          nav { padding: 0 20px !important; }
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}
