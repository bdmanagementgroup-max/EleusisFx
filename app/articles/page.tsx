import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import ArticlesList from "@/components/articles/ArticlesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles — Eleusis FX",
  description: "Trading insights, prop firm guides, and strategy breakdowns from the Eleusis FX team.",
};

const FALLBACK_ARTICLES = [
  {
    slug: "what-is-an-ftmo-challenge",
    tag: "Prop Firms",
    title: "What Is an FTMO Challenge and How Does It Work?",
    excerpt: "A complete breakdown of the FTMO evaluation process — phases, rules, drawdown limits, and what you need to know before starting your challenge.",
    date: "June 2025",
    readTime: "8 min read",
    sortKey: "2025-06-01",
  },
  {
    slug: "why-traders-fail-prop-firm-evaluation",
    tag: "Strategy",
    title: "Why Most Traders Fail Their Prop Firm Evaluation",
    excerpt: "The three most common reasons traders get disqualified — and how professional evaluation services eliminate these risks entirely.",
    date: "May 2025",
    readTime: "7 min read",
    sortKey: "2025-05-01",
  },
  {
    slug: "ftmo-vs-true-forex-funds",
    tag: "Funding",
    title: "FTMO vs True Forex Funds: Which Prop Firm Is Right for You?",
    excerpt: "A side-by-side comparison of the two most popular prop firms — fees, rules, payout structures, and which suits different trading styles.",
    date: "April 2025",
    readTime: "9 min read",
    sortKey: "2025-04-01",
  },
];

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function ArticlesPage() {
  const supabase = await getSupabaseAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, category, title, excerpt, published_at, read_time")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const dbArticles = data ?? [];
  const articles = dbArticles.length > 0
    ? dbArticles.map((a) => ({
        slug: a.slug,
        tag: a.category ?? "Trading",
        title: a.title,
        excerpt: a.excerpt ?? "",
        date: formatDate(a.published_at),
        readTime: a.read_time ? `${a.read_time} min read` : "",
        sortKey: a.published_at ?? "",
      }))
    : FALLBACK_ARTICLES;

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "100px 56px 60px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Trading Insights
          </div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 0.95, letterSpacing: -2, marginBottom: 24 }}>
            Articles &amp; Guides
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(210,220,240,0.88)", maxWidth: 560 }}>
            Prop firm breakdowns, strategy insights, and everything you need to understand funded trading.
          </p>
        </section>

        <section style={{ padding: "0 56px 140px", position: "relative", zIndex: 1 }}>
          <ArticlesList articles={articles} />
        </section>
      </main>
      <Footer />

      <style>{`
        .article-card-item {
          background: #08090f; border: 1px solid rgba(255,255,255,0.06);
          padding: 36px 32px; text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden; transition: all 0.3s;
        }
        .article-card-item::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #4f8ef7, transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .article-card-item:hover { border-color: rgba(79,142,247,0.3); transform: translateY(-4px); }
        .article-card-item:hover::before { opacity: 1; }
        .article-card-item:hover h2 { color: #7eb3ff; }
        .article-card-item:hover .article-arrow-item { color: #4f8ef7; transform: translateX(4px); }
        @media (max-width: 1024px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
