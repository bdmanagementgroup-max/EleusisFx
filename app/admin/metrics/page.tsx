import { getSupabaseAdminClient } from "@/lib/supabase/server";
import MetricsPageClient from "./MetricsPageClient";

export const dynamic = "force-dynamic";

export default async function AdminMetricsPage() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: metrics }, usersResult, { data: pastClients }] = await Promise.all([
    supabase.from("client_metrics").select("*").order("updated_at", { ascending: false }),
    supabase.auth.admin.listUsers(),
    supabase.from("past_clients").select("id,name,challenge_result,phase_status,account_size_usd,profit_target,max_drawdown,prop_firm").order("name"),
  ]);

  const users = usersResult.data?.users ?? [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));
  const activeRows = (metrics ?? []).map((m) => ({ ...m, email: userMap[m.user_id] ?? "—" }));

  return (
    <div style={{ padding: "40px 48px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Admin</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5, marginBottom: 32 }}>Client Metrics</h1>
      <MetricsPageClient activeRows={activeRows} pastRows={pastClients ?? []} />
    </div>
  );
}
