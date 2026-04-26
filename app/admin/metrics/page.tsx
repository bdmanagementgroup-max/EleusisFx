import { getSupabaseAdminClient } from "@/lib/supabase/server";
import MetricsClient from "./MetricsClient";

export const dynamic = "force-dynamic";

export default async function AdminMetricsPage() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: metrics }, { data: { users } }] = await Promise.all([
    supabase.from("client_metrics").select("*").order("updated_at", { ascending: false }),
    supabase.auth.admin.listUsers(),
  ]);

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.email]));

  const rows = (metrics ?? []).map((m) => ({
    ...m,
    email: userMap[m.user_id] ?? "—",
  }));

  return (
    <div style={{ padding: "56px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 48 }}>Client Metrics</h1>
      <MetricsClient rows={rows} />
    </div>
  );
}
