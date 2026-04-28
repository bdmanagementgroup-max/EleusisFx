"use client";
import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/dashboard/LogoutButton";

type NavItem =
  | { href: string; label: string }
  | { divider: true }
  | { accordion: true; label: string; items: { href: string; label: string }[] };

const NAV: NavItem[] = [
  { href: "/dashboard",          label: "Overview" },
  { href: "/dashboard/markets",  label: "Live Markets" },
  { href: "/dashboard/calendar", label: "Economic Calendar" },
  { divider: true },
  {
    accordion: true,
    label: "Resources",
    items: [
      { href: "/resources/position-size-calculator", label: "Position Size" },
      { href: "/resources/risk-reward-calculator",   label: "Risk / Reward" },
      { href: "/resources/drawdown-tracker",         label: "Drawdown Tracker" },
    ],
  },
  { divider: true },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/support",       label: "Support" },
  { href: "/dashboard/documents",     label: "Documents" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#020305" }}>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(2,3,5,0.75)",
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar${open ? " open" : ""}`}>
        <div style={{ padding: "0 28px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: 5, textTransform: "uppercase", color: "#e8eaf0" }}>
                ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
              </div>
            </Link>
            <div style={{ marginTop: 8, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>Client Portal</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="dashboard-sidebar-close"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: "24px 0", overflowY: "auto" }}>
          {NAV.map((item, i) => {
            if ("divider" in item) {
              return <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 28px" }} />;
            }

            if ("accordion" in item) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setResourcesOpen((v) => !v)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "12px 28px",
                      fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                      color: "rgba(210,220,240,0.88)",
                      background: "transparent", border: "none", cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{
                      fontSize: 9,
                      display: "inline-block",
                      transition: "transform 0.2s",
                      transform: resourcesOpen ? "rotate(90deg)" : "rotate(0deg)",
                      color: "rgba(210,220,240,0.5)",
                    }}>▶</span>
                  </button>
                  {resourcesOpen && (
                    <div>
                      {item.items.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setOpen(false)}
                          style={{
                            display: "block", padding: "10px 28px 10px 40px",
                            fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                            color: "rgba(210,220,240,0.58)", textDecoration: "none",
                            transition: "all 0.2s",
                          }}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const { href, label } = item as { href: string; label: string };
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "12px 28px",
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: "rgba(210,220,240,0.88)", textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            style={{
              display: "block", padding: "10px 0 16px",
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              color: "rgba(210,220,240,0.88)", textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            Profile
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpen(true)}
          className="dashboard-hamburger"
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>

        {children}
      </main>

      <style>{`
        .dashboard-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #08090f;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 32px 0;
          position: fixed;
          top: 0; bottom: 0; left: 0;
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform 0.25s ease;
        }
        .dashboard-main {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
          overflow-y: auto;
        }
        .dashboard-hamburger { display: none; }
        .dashboard-sidebar-close { display: none; }

        @media (max-width: 768px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          .dashboard-main {
            margin-left: 0;
            padding-top: 56px;
            overflow-x: hidden;
          }
          .dashboard-hamburger {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            position: fixed;
            top: 14px; left: 16px;
            z-index: 30;
            background: #08090f;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 10px 12px;
            cursor: pointer;
            border-radius: 2px;
          }
          .dashboard-hamburger span {
            display: block;
            width: 18px; height: 2px;
            background: #e8eaf0;
            border-radius: 1px;
          }
          .dashboard-sidebar-close {
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: rgba(210,220,240,0.5);
            font-size: 14px;
            cursor: pointer;
            padding: 4px;
            margin-top: 2px;
          }
          .dashboard-sidebar-close:hover { color: #e8eaf0; }
        }
        .dashboard-sidebar nav a:hover,
        .dashboard-sidebar nav button:hover {
          color: #e8eaf0 !important;
          background: rgba(79,142,247,0.05);
        }
      `}</style>
    </div>
  );
}
