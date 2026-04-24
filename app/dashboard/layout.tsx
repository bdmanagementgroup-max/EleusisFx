import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Eleusis FX",
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/markets", label: "Live Markets" },
  { href: "/dashboard/calendar", label: "Economic Calendar" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#020305" }}>
      {/* Top bar */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px",
          background: "rgba(2,3,5,0.95)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: 5, textTransform: "uppercase", color: "#e8eaf0" }}>
              ELEUSIS<span style={{ color: "#4f8ef7" }}>.</span>FX
            </div>
          </Link>
          <nav style={{ display: "flex", gap: 32 }}>
            {NAV_ITEMS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", textDecoration: "none", transition: "color 0.2s" }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <DashboardLogout />
      </header>

      <main style={{ paddingTop: 64, flex: 1 }}>
        {children}
      </main>
    </div>
  );
}

function DashboardLogout() {
  return <LogoutButton />;
}

// Client component for logout
import LogoutButton from "@/components/dashboard/LogoutButton";
