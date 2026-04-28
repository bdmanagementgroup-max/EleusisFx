import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function AdminArticlesPage() {
  const supabase = await getSupabaseAdminClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, published, published_at, created_at")
    .order("created_at", { ascending: false });

  const rows = articles ?? [];

  return (
    <div className="admin-articles-page">
      <div className="admin-articles-header">
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Content</div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1.5 }}>Articles</h1>
        </div>
        <Link href="/admin/articles/new" className="new-article-btn">
          <span>+ New Article</span>
        </Link>
      </div>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 480 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Title", "Status", "Date", "Actions"].map((h) => (
              <span key={h} style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>{h}</span>
            ))}
          </div>

          {rows.length === 0 && (
            <div style={{ padding: "40px 28px", fontSize: 13, color: "rgba(210,220,240,0.88)" }}>
              No articles yet. <Link href="/admin/articles/new" style={{ color: "#4f8ef7" }}>Create your first article →</Link>
            </div>
          )}

          {rows.map(({ id, slug, title, published, published_at, created_at }) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 24 }}>
              <div>
                <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "#e8eaf0", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 11, color: "rgba(210,220,240,0.88)" }}>/articles/{slug}</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", border: published ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.12)", background: published ? "rgba(34,197,94,0.05)" : "transparent", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: published ? "#22c55e" : "rgba(210,220,240,0.88)" }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: published ? "#22c55e" : "rgba(210,220,240,0.88)", display: "inline-block" }} />
                {published ? "Published" : "Draft"}
              </div>
              <span style={{ fontSize: 11, color: "rgba(210,220,240,0.88)", whiteSpace: "nowrap" }}>{formatDate(published_at ?? created_at)}</span>
              <div style={{ display: "flex", gap: 16 }}>
                <Link href={`/articles/${slug}`} style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", textDecoration: "none" }}>View →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .admin-articles-page { padding: 56px 48px 80px; }
        .admin-articles-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
        }
        .new-article-btn {
          font-family: var(--font-syne), Syne, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: #020305; background: #e8eaf0;
          padding: 12px 24px; text-decoration: none;
          transition: all 0.2s; position: relative; overflow: hidden;
          flex-shrink: 0;
        }
        .new-article-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #4f8ef7; transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .new-article-btn:hover::after { transform: translateX(0); }
        .new-article-btn span { position: relative; z-index: 1; color: #020305; }
        .new-article-btn:hover span { color: #e8eaf0; }
        @media (max-width: 768px) {
          .admin-articles-page { padding: 72px 16px 60px; }
          .admin-articles-header {
            flex-direction: column;
            gap: 16px;
            margin-bottom: 28px;
          }
        }
      `}</style>
    </div>
  );
}
