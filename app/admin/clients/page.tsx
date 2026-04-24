const DEMO_CLIENTS = [
  { id: "1", name: "James Harrington", email: "james@email.com", propFirm: "FTMO", status: "active", created: "Jan 2025" },
  { id: "2", name: "Sophie Chen", email: "sophie@email.com", propFirm: "True Forex Funds", status: "funded", created: "Feb 2025" },
  { id: "3", name: "Marcus Webb", email: "marcus@email.com", propFirm: "FTMO", status: "pending", created: "Mar 2025" },
];

const DEMO_APPS = [
  { id: "a1", name: "David Okoye", email: "david@email.com", propFirm: "FTMO", submitted: "Apr 2025", status: "new" },
  { id: "a2", name: "Chloe Baxter", email: "chloe@email.com", propFirm: "True Forex Funds", submitted: "Apr 2025", status: "reviewed" },
];

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  active: { color: "#4f8ef7", bg: "rgba(79,142,247,0.08)" },
  funded: { color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  new: { color: "#e8eaf0", bg: "rgba(232,234,240,0.05)" },
  reviewed: { color: "#7eb3ff", bg: "rgba(126,179,255,0.08)" },
};

export default function AdminClientsPage() {
  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>CRM</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 48 }}>Clients</h1>

      {/* Applications queue */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          New Applications
          <span style={{ fontSize: 11, background: "rgba(79,142,247,0.15)", color: "#4f8ef7", padding: "3px 10px", letterSpacing: 1 }}>{DEMO_APPS.length}</span>
        </h2>
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {DEMO_APPS.map(({ id, name, email, propFirm, submitted, status }) => {
            const s = STATUS_COLORS[status] ?? STATUS_COLORS.new;
            return (
              <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "rgba(232,234,240,0.38)" }}>{email}</div>
                </div>
                <span style={{ fontSize: 12, color: "rgba(232,234,240,0.38)" }}>{propFirm}</span>
                <span style={{ fontSize: 11, color: "rgba(232,234,240,0.18)" }}>{submitted}</span>
                <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px", background: s.bg, color: s.color }}>{status}</span>
                <button style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f8ef7", background: "transparent", border: "1px solid rgba(79,142,247,0.3)", padding: "6px 14px", cursor: "pointer" }}>
                  Review
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clients */}
      <div>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Active Clients</h2>
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
          </div>
          {DEMO_CLIENTS.map(({ id, name, email, propFirm, status, created }) => {
            const s = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
            return (
              <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "rgba(232,234,240,0.38)" }}>{email}</div>
                </div>
                <span style={{ fontSize: 12, color: "rgba(232,234,240,0.38)" }}>{propFirm}</span>
                <span style={{ fontSize: 11, color: "rgba(232,234,240,0.18)" }}>{created}</span>
                <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px", background: s.bg, color: s.color }}>{status}</span>
                <button style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 14px", cursor: "pointer" }}>
                  View
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
