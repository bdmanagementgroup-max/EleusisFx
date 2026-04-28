"use client";
import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/dashboard/LogoutButton";
import AdminMarketTicker from "@/components/admin/AdminMarketTicker";
import AdminStatusBar from "@/components/admin/AdminStatusBar";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/metrics", label: "Evaluation Metrics" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/past-clients", label: "Past Clients" },
  { divider: true },
  { href: "/admin/tools/email", label: "Email Editor", section: "Tools" },
  { href: "/admin/tools/instagram", label: "Instagram Metrics" },
  { href: "/admin/tools/chart", label: "Chart Tool" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

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
      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div style={{ padding: "0 28px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: 5, textTransform: "uppercase", color: "#e8eaf0" }}>
                ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
              </div>
            </Link>
            <div style={{ marginTop: 8, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>Admin Panel</div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setOpen(false)}
            className="sidebar-close"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: "24px 0" }}>
          {NAV.map((item, i) => {
            if ("divider" in item) {
              return <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 28px" }} />;
            }
            const { href, label, section } = item as { href: string; label: string; section?: string };
            return (
              <div key={href}>
                {section && (
                  <div style={{ padding: "0 28px 6px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)" }}>
                    {section}
                  </div>
                )}
                <Link
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
              </div>
            );
          })}
        </nav>

        <div style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpen(true)}
          className="admin-hamburger"
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>

        <AdminMarketTicker />
        {children}
      </main>
      <AdminStatusBar />

      <style>{`
        .admin-sidebar {
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
        .admin-main {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
          overflow-y: auto;
          padding-right: 172px;
        }
        .admin-hamburger { display: none; }
        .sidebar-close { display: none; }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0;
            padding-top: 56px;
            padding-right: 0;
            overflow-x: hidden;
          }
          .admin-hamburger {
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
          .admin-hamburger span {
            display: block;
            width: 18px; height: 2px;
            background: #e8eaf0;
            border-radius: 1px;
          }
          .sidebar-close {
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
          .sidebar-close:hover { color: #e8eaf0; }
        }
        nav a:hover { color: #e8eaf0 !important; background: rgba(79,142,247,0.05); }
      `}</style>
    </div>
  );
}
