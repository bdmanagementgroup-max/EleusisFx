import { getSupabaseAdminClient } from "@/lib/supabase/server";
import DocumentsAdminClient from "./DocumentsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const supabase = await getSupabaseAdminClient();

  const [{ data: docs }, { data: { users } }] = await Promise.all([
    supabase.from("client_documents").select("*").order("created_at", { ascending: false }),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const clients = (users ?? [])
    .filter((u) => u.app_metadata?.role !== "admin" && u.email)
    .map((u) => ({
      id: u.id,
      label: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email!,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return <DocumentsAdminClient initial={docs ?? []} clients={clients} />;
}
