import Link from "next/link";

const TILES = [
  { href: "/admin/articles", label: "Articles", desc: "Create, edit, and publish articles to the site." },
  { href: "/admin/clients", label: "Clients", desc: "View client applications and manage client accounts." },
  { href: "/admin/resources", label: "Resources", desc: "Add prop firm guides, tools, and PDF downloads." },
];

export default function AdminOverview() {
  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 48 }}>Overview</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {TILES.map(({ href, label, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div className="admin-tile">
              <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 12, color: "#e8eaf0" }}>{label}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(232,234,240,0.38)" }}>{desc}</p>
              <div style={{ marginTop: 24, fontSize: 12, color: "#4f8ef7" }}>Manage →</div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .admin-tile {
          background: #08090f; border: 1px solid rgba(255,255,255,0.06);
          padding: 32px 28px; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .admin-tile::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #4f8ef7, transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .admin-tile:hover { border-color: rgba(79,142,247,0.3); transform: translateY(-2px); }
        .admin-tile:hover::before { opacity: 1; }
      `}</style>
    </div>
  );
}
