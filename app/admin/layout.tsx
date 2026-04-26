import Link from "next/link";
import LogoutButton from "@/components/dashboard/LogoutButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Eleusis FX" };

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/past-clients", label: "Past Clients" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#020305" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240, flexShrink: 0,
          background: "#08090f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 0",
          position: "fixed", top: 0, bottom: 0, left: 0,
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 28px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: 5, textTransform: "uppercase", color: "#e8eaf0" }}>
              ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
            </div>
          </Link>
          <div style={{ marginTop: 8, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1, padding: "24px 0" }}>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "block", padding: "12px 28px",
                fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                color: "rgba(210,220,240,0.88)", textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: "100vh" }}>
        {children}
      </main>

      <style>{`
        nav a:hover { color: #e8eaf0 !important; background: rgba(79,142,247,0.05); }
      `}</style>
    </div>
  );
}
