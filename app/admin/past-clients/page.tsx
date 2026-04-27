import { getSupabaseAdminClient } from "@/lib/supabase/server";
import PastClientsClient from "./PastClientsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Past Clients — Admin",
};

export default async function PastClientsPage() {
  const supabase = await getSupabaseAdminClient();
  const { data: clients, error } = await supabase
    .from("past_clients")
    .select("*")
    .order("name");

  return (
    <div style={{ padding: "40px 48px", background: "#020305", minHeight: "100vh" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 12 }}>
          Admin · Past Clients
        </div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1, color: "#e8eaf0", marginBottom: 8 }}>
          FTMO Client Database
        </h1>
        <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
          {clients?.length ?? 0} records · Extracted from client service agreements. Click a row to add email, phone, or notes.
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "20px 24px", marginBottom: 24, fontSize: 13, color: "#ef4444" }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Database error: {error.message}</div>
          <div style={{ fontSize: 12, color: "rgba(239,68,68,0.7)", marginBottom: 12 }}>
            Run the following SQL in your Supabase SQL editor (looplcpivxolszawqgii.supabase.co):
          </div>
          <pre style={{ margin: 0, fontSize: 11, color: "rgba(239,68,68,0.9)", background: "rgba(239,68,68,0.06)", padding: "10px 14px", overflowX: "auto" }}>
{`-- Paste and run past-clients-migration.sql in full, then:
NOTIFY pgrst, 'reload schema';`}
          </pre>
        </div>
      )}

      <PastClientsClient clients={clients ?? []} />
    </div>
  );
}
