import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Document = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  created_at: string;
};

export default async function DocumentsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: docs } = await supabase
    .from("client_documents")
    .select("id, title, description, file_url, created_at")
    .order("created_at", { ascending: false });

  const documents: Document[] = docs ?? [];

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: 720 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
        Resources
      </div>
      <h1 style={{
        fontFamily: "var(--font-syne), Syne, sans-serif",
        fontWeight: 800, fontSize: 32, letterSpacing: -1,
        color: "#e8eaf0", margin: "0 0 48px",
      }}>
        Documents
      </h1>

      {documents.length === 0 ? (
        <div style={{
          padding: "48px 28px",
          background: "#08090f",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 4,
          textAlign: "center",
        }}>
          <p style={{ color: "rgba(210,220,240,0.58)", fontSize: 13, margin: 0 }}>
            No documents available yet — check back soon.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                padding: "20px 24px",
                background: "#08090f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-syne), Syne, sans-serif",
                  fontWeight: 700, fontSize: 14,
                  color: "#e8eaf0", marginBottom: doc.description ? 4 : 0,
                }}>
                  {doc.title}
                </div>
                {doc.description && (
                  <p style={{ color: "rgba(210,220,240,0.58)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                    {doc.description}
                  </p>
                )}
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink: 0,
                  padding: "9px 20px",
                  background: "transparent",
                  border: "1px solid rgba(79,142,247,0.4)",
                  borderRadius: 2,
                  color: "#4f8ef7",
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
