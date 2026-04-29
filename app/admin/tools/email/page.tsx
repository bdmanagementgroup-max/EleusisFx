import { getSupabaseAdminClient } from "@/lib/supabase/server";
import EmailEditorClient from "./EmailEditorClient";

export const dynamic = "force-dynamic";

export type Recipient = {
  label: string;
  email: string;
  group: "Active Clients" | "Past Clients";
};

export default async function EmailEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; to?: string; name?: string }>;
}) {
  const supabase = await getSupabaseAdminClient();
  const { template, to, name } = await searchParams;

  const [{ data: pastClients }, { data: { users } }] = await Promise.all([
    supabase
      .from("past_clients")
      .select("name, email")
      .not("email", "is", null)
      .order("name"),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const recipients: Recipient[] = [];

  for (const u of users ?? []) {
    if (u.app_metadata?.role === "admin") continue;
    const email = u.email;
    if (!email) continue;
    const label = u.user_metadata?.name ?? u.user_metadata?.full_name ?? email;
    recipients.push({ label, email, group: "Active Clients" });
  }

  for (const c of pastClients ?? []) {
    if (!c.email) continue;
    recipients.push({ label: c.name ?? c.email, email: c.email, group: "Past Clients" });
  }

  return (
    <EmailEditorClient
      recipients={recipients}
      defaultTemplate={template}
      defaultTo={to}
      defaultName={name}
    />
  );
}
