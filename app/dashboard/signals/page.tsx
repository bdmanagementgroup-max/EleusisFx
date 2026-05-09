import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analysis — Eleusis FX Dashboard",
};

interface Signal {
  id: string;
  created_at: string;
  session: string;
  focus: string;
  body_md: string;
}

export default async function SignalsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.app_metadata?.role;
  if (!user || (role !== "subscriber" && role !== "admin")) {
    redirect("/signals");
  }

  const { data: signals, error } = await supabase
    .from("signals")
    .select("id, created_at, session, focus, body_md")
    .order("created_at", { ascending: false })
    .limit(30);

  const signalList = (signals ?? []) as Signal[];

  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>
          Analysis
        </div>
        <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>
          Latest Analysis
        </h1>
      </div>

      {error && (
        <div style={{ padding: "16px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, color: "#ef4444", marginBottom: 32 }}>
          Failed to load signals: {error.message}
        </div>
      )}

      {signalList.length === 0 && !error && (
        <div style={{ padding: "40px", background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, textAlign: "center" }}>
          <p style={{ color: "rgba(210,220,240,0.88)" }}>No analysis posted yet. Check back soon.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        {signalList.map((signal) => {
          const date = new Date(signal.created_at).toLocaleDateString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={signal.id}
              style={{
                background: "#08090f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4,
                padding: "32px 28px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.58)", marginBottom: 4 }}>
                    {signal.session}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "rgba(210,220,240,0.4)" }}>
                    {date}
                  </div>
                </div>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(79,142,247,0.7)", background: "rgba(79,142,247,0.1)", padding: "6px 12px", borderRadius: 2 }}>
                  {signal.focus}
                </div>
              </div>

              <div style={{ fontSize: 14, lineHeight: 1.8, color: "#e8eaf0" }}>
                <ReactMarkdown
                  components={{
                    h2: ({ node, ...props }) => (
                      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 24, marginBottom: 12, color: "#e8eaf0", fontFamily: "var(--font-syne), Syne, sans-serif" }} {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8, color: "#7eb3ff" }} {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong style={{ fontWeight: 700, color: "#7eb3ff" }} {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em style={{ fontStyle: "italic", color: "rgba(210,220,240,0.88)" }} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul style={{ marginLeft: 20, marginBottom: 12 }} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol style={{ marginLeft: 20, marginBottom: 12 }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li style={{ marginBottom: 6 }} {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code style={{ background: "rgba(79,142,247,0.1)", padding: "2px 6px", borderRadius: 2, fontFamily: "monospace", fontSize: 13 }} {...props} />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 4, overflow: "auto", marginBottom: 12 }} {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "24px 0" }} {...props} />
                    ),
                  }}
                >
                  {signal.body_md}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
