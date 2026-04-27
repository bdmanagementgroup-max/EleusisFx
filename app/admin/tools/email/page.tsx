import { getSupabaseAdminClient } from "@/lib/supabase/server";
import EmailEditorClient from "./EmailEditorClient";

export const dynamic = "force-dynamic";

export type Recipient = {
  label: string;
  email: string;
  group: "Active Clients" | "Past Clients";
};

export default async function EmailEditorPage() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: pastClients }, { data: { users } }] = await Promise.all([
    supabase
      .from("past_clients")
      .select("name, email")
      .not("email", "is", null)
      .order("name"),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const recipients: Recipient[] = [];

  // Active clients — auth users with dashboard access (exclude admins)
  for (const u of users ?? []) {
    if (u.app_metadata?.role === "admin") continue;
    const email = u.email;
    if (!email) continue;
    const name = u.user_metadata?.name ?? u.user_metadata?.full_name ?? email;
    recipients.push({ label: name, email, group: "Active Clients" });
  }

  // Past clients
  for (const c of pastClients ?? []) {
    if (!c.email) continue;
    recipients.push({ label: c.name ?? c.email, email: c.email, group: "Past Clients" });
  }

  return <EmailEditorClient recipients={recipients} />;
}
