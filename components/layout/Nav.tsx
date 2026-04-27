"use client";

import Link from "next/link";
import { useState } from "react";

const DROPDOWN_ITEMS = [
  { href: "/articles", label: "Articles" },
  { href: "/compare", label: "Compare Firms" },
  { href: "/calendar", label: "Economic Calendar" },
  { divider: true },
  { href: "/resources/position-size-calculator", label: "Position Size Calculator" },
  { href: "/resources/risk-reward-calculator", label: "Risk-Reward Calculator" },
  { href: "/resources/drawdown-tracker", label: "Drawdown Tracker" },
  { divider: true },
  { href: "/resources", label: "All Resources" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileResOpen, setMobileResOpen] = useState(false);

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

          {/* Resources dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button
              className="nav-link-item"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Resources
              <svg
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="none"
                style={{
                  transition: "transform 0.2s",
                  transform: dropOpen ? "rotate(180deg)" : "none",
                  opacity: 0.6,
                }}
              >
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: -16,
                  background: "rgba(8,9,15,0.98)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  minWidth: 220,
                  padding: "20px 0 8px",
                }}
              >
                {DROPDOWN_ITEMS.map((item, i) =>
                  "divider" in item ? (
                    <div
                      key={i}
                      style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }}
                    />
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropOpen(false)}
                      style={{
                        display: "block",
                        padding: "10px 20px",
                        fontSize: 11,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: "rgba(210,220,240,0.8)",
                        textDecoration: "none",
                        transition: "color 0.15s, background 0.15s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(210,220,240,0.8)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

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
            overflowY: "auto",
          }}
        >
          {[
            { href: "/#process", label: "Process" },
            { href: "/#results", label: "Results" },
            { href: "/#pricing", label: "Pricing" },
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

          {/* Mobile Resources accordion */}
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => setMobileResOpen(!mobileResOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: -0.5,
                color: "rgba(232,234,240,0.6)",
                padding: "18px 0",
              }}
            >
              Resources
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" style={{ transition: "transform 0.2s", transform: mobileResOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {mobileResOpen && (
              <div style={{ paddingBottom: 12 }}>
                {DROPDOWN_ITEMS.map((item, i) =>
                  "divider" in item ? (
                    <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setOpen(false); setMobileResOpen(false); }}
                      style={{
                        display: "block",
                        padding: "10px 0 10px 16px",
                        fontSize: 14,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        color: "rgba(210,220,240,0.6)",
                        textDecoration: "none",
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <a
            href="/#free-guide"
            onClick={() => setOpen(false)}
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: -0.5,
              color: "#4f8ef7",
              textDecoration: "none",
              padding: "18px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Free Guide
          </a>

          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={{
                flex: 1, textAlign: "center",
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 600, fontSize: 11, letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(210,220,240,0.88)",
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
          color: rgba(210,220,240,0.88); text-decoration: none; transition: color 0.2s;
        }
        .nav-link-item:hover { color: #e8eaf0; }
        .nav-btn-item {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: rgba(210,220,240,0.88);
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
          display: flex; align-items: center; gap: 40px;
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
