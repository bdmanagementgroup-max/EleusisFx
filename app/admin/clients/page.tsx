import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  new:      { color: "#e8eaf0", bg: "rgba(232,234,240,0.05)" },
  reviewed: { color: "#7eb3ff", bg: "rgba(126,179,255,0.08)" },
  active:   { color: "#4f8ef7", bg: "rgba(79,142,247,0.08)" },
  funded:   { color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminClientsPage() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: applications }, { data: leads }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, first_name, last_name, email, prop_firm, notes, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const apps = applications ?? [];
  const emailLeads = leads ?? [];

  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>CRM</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 48 }}>Clients</h1>

      {/* Applications */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          Applications
          <span style={{ fontSize: 11, background: "rgba(79,142,247,0.15)", color: "#4f8ef7", padding: "3px 10px", letterSpacing: 1 }}>{apps.length}</span>
        </h2>

        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />

          {apps.length === 0 ? (
            <div style={{ padding: "40px 28px", fontSize: 13, color: "rgba(232,234,240,0.38)" }}>
              No applications yet — they'll appear here when someone submits the website form.
            </div>
          ) : (
            apps.map(({ id, first_name, last_name, email, prop_firm, created_at }) => {
              const s = STATUS_COLORS.new;
              return (
                <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 20 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>{first_name} {last_name}</div>
                    <div style={{ fontSize: 11, color: "rgba(232,234,240,0.38)" }}>{email}</div>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(232,234,240,0.38)" }}>{prop_firm || "—"}</span>
                  <span style={{ fontSize: 11, color: "rgba(232,234,240,0.18)", whiteSpace: "nowrap" }}>{formatDate(created_at)}</span>
                  <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 12px", background: s.bg, color: s.color }}>New</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Email leads */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          Email Leads
          <span style={{ fontSize: 11, background: "rgba(79,142,247,0.15)", color: "#4f8ef7", padding: "3px 10px", letterSpacing: 1 }}>{emailLeads.length}</span>
        </h2>

        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {emailLeads.length === 0 ? (
            <div style={{ padding: "40px 28px", fontSize: 13, color: "rgba(232,234,240,0.38)" }}>
              No email leads yet — they'll appear here when someone downloads the free guide.
            </div>
          ) : (
            emailLeads.map(({ id, email, source, created_at }) => (
              <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 20 }}>
                <span style={{ fontSize: 13, color: "#e8eaf0" }}>{email}</span>
                <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>{source ?? "free_guide"}</span>
                <span style={{ fontSize: 11, color: "rgba(232,234,240,0.18)", whiteSpace: "nowrap" }}>{formatDate(created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
