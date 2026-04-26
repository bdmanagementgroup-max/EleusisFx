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
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "14px 20px", marginBottom: 24, fontSize: 13, color: "#ef4444" }}>
          Database error: {error.message}. Run past-clients-migration.sql in Supabase first.
        </div>
      )}

      <PastClientsClient clients={clients ?? []} />
    </div>
  );
}
