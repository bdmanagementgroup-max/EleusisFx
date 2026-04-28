import { getSupabaseAdminClient } from "@/lib/supabase/server";
import SupportAdminClient, { type Ticket } from "./SupportAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: tickets }, { data: { users } }] = await Promise.all([
    supabase
      .from("support_tickets")
      .select("id, subject, message, status, created_at, user_id")
      .order("created_at", { ascending: false }),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const userMap = new Map(
    (users ?? []).map((u) => [
      u.id,
      {
        email: u.email ?? "unknown",
        name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email ?? "Unknown",
      },
    ])
  );

  const enriched: Ticket[] = (tickets ?? []).map((t) => {
    const u = userMap.get(t.user_id) ?? { email: "unknown", name: "Unknown" };
    return {
      id: t.id,
      subject: t.subject,
      message: t.message,
      status: t.status ?? "open",
      created_at: t.created_at,
      user_email: u.email,
      user_name: u.name,
    };
  });

  return <SupportAdminClient tickets={enriched} />;
}
