import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import AdminClientsClient from "@/components/admin/AdminClientsClient";
import AdminLeadsClient from "@/components/admin/AdminLeadsClient";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = await getSupabaseAdminClient();

  const [appsResult, leadsResult] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const appsError = appsResult.error?.message ?? null;
  const apps = (appsResult.data ?? []).map((a: any) => ({ ...a, status: a.status ?? "new" }));
  const emailLeads = leadsResult.data ?? [];

  return (
    <div className="admin-clients-page">
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>CRM</div>
      <div className="admin-clients-header">
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5 }}>Clients</h1>
        <Link
          href="/admin/clients/new"
          style={{
            display: "inline-block", background: "#4f8ef7", color: "#020305",
            fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700,
            fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            padding: "12px 24px", textDecoration: "none", flexShrink: 0,
          }}
        >
          + New Client
        </Link>
      </div>

      {/* Applications */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          Applications
          <span style={{ fontSize: 11, background: "rgba(79,142,247,0.15)", color: "#4f8ef7", padding: "3px 10px", letterSpacing: 1 }}>{apps.length}</span>
        </h2>
        {appsError && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "14px 20px", marginBottom: 16, fontSize: 12, fontFamily: "monospace" }}>
            DB error: {appsError}
          </div>
        )}
        <AdminClientsClient applications={apps} />
      </div>

      {/* Email leads */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          Email Leads
          <span style={{ fontSize: 11, background: "rgba(79,142,247,0.15)", color: "#4f8ef7", padding: "3px 10px", letterSpacing: 1 }}>{emailLeads.length}</span>
        </h2>
        <AdminLeadsClient leads={emailLeads} />
      </div>

      <style>{`
        .admin-clients-page { padding: 56px 48px 80px; }
        .admin-clients-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        @media (max-width: 768px) {
          .admin-clients-page { padding: 72px 16px 60px; }
          .admin-clients-header {
            flex-direction: column;
            gap: 16px;
            margin-bottom: 28px;
          }
        }
      `}</style>
    </div>
  );
}
