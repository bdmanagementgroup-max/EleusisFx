import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles — Eleusis FX",
  description: "Trading insights, prop firm guides, and strategy breakdowns from the Eleusis FX team.",
};

const ARTICLES = [
  {
    slug: "what-is-an-ftmo-challenge",
    tag: "Prop Firms",
    title: "What Is an FTMO Challenge and How Does It Work?",
    excerpt: "A complete breakdown of the FTMO evaluation process — phases, rules, drawdown limits, and what you need to know before starting your challenge.",
    date: "June 2025",
    readTime: "8 min read",
  },
  {
    slug: "why-traders-fail-prop-firm-evaluation",
    tag: "Strategy",
    title: "Why Most Traders Fail Their Prop Firm Evaluation",
    excerpt: "The three most common reasons traders get disqualified — and how professional evaluation services eliminate these risks entirely.",
    date: "May 2025",
    readTime: "7 min read",
  },
  {
    slug: "ftmo-vs-true-forex-funds",
    tag: "Funding",
    title: "FTMO vs True Forex Funds: Which Prop Firm Is Right for You?",
    excerpt: "A side-by-side comparison of the two most popular prop firms — fees, rules, payout structures, and which suits different trading styles.",
    date: "April 2025",
    readTime: "9 min read",
  },
];

export default function ArticlesPage() {
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
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(232,234,240,0.38)", maxWidth: 560 }}>
            Prop firm breakdowns, strategy insights, and everything you need to understand funded trading.
          </p>
        </section>

        <section style={{ padding: "0 56px 140px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {ARTICLES.map(({ slug, tag, title, excerpt, date, readTime }) => (
              <Link key={slug} href={`/articles/${slug}`} className="article-card-item">
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#4f8ef7", marginBottom: 20 }}>
                  <span style={{ width: 16, height: 1, background: "#4f8ef7", display: "inline-block" }} />
                  {tag}
                </div>
                <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1.25, letterSpacing: -0.4, marginBottom: 16, color: "#e8eaf0", transition: "color 0.2s" }}>
                  {title}
                </h2>
                <p style={{ fontSize: 13, lineHeight: 1.85, color: "rgba(232,234,240,0.38)", flex: 1, marginBottom: 28 }}>{excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" as const, color: "rgba(232,234,240,0.18)" }}>{date} · {readTime}</span>
                  <span className="article-arrow-item" style={{ fontSize: 12, color: "rgba(232,234,240,0.18)", transition: "all 0.2s" }}>→</span>
                </div>
              </Link>
            ))}
          </div>
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
