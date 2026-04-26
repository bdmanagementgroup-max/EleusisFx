import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const revalidate = 3600;

const HARDCODED: Record<string, { tag: string; title: string; excerpt: string; date: string; readTime: string; content: string }> = {
  "what-is-an-ftmo-challenge": {
    tag: "Prop Firms",
    title: "What Is an FTMO Challenge and How Does It Work?",
    excerpt: "A complete breakdown of the FTMO evaluation process — phases, rules, drawdown limits, and what you need to know before starting your challenge.",
    date: "June 2025",
    readTime: "8 min read",
    content: `
      <h2>The FTMO Evaluation Model</h2>
      <p>FTMO is one of the most popular prop trading firms in the world, offering traders up to $200,000 in funded capital. But before you get access to that capital, you need to pass their two-phase evaluation process.</p>
      <h2>Phase 1: The Challenge</h2>
      <p>In Phase 1, you must hit a <strong>10% profit target</strong> within 30 trading days. You must also stay within a 5% daily loss limit and a 10% maximum drawdown at all times.</p>
      <h2>Phase 2: The Verification</h2>
      <p>Phase 2 is similar but with a reduced profit target of <strong>5%</strong> over 60 days. The same risk rules apply. Once complete, FTMO reviews your account and onboards you as a funded trader.</p>
      <h2>Key Rules to Know</h2>
      <ul>
        <li>Minimum 4 trading days per phase</li>
        <li>Daily loss limit: 5% of initial account balance</li>
        <li>Maximum drawdown: 10% of initial account balance</li>
        <li>Profit split: up to 90%</li>
      </ul>
      <h2>Why Most Traders Fail</h2>
      <p>The FTMO pass rate is under 10% for self-directed traders. The primary causes are overleveraging, revenge trading after losses, and misunderstanding the daily loss calculation methodology.</p>
    `,
  },
  "why-traders-fail-prop-firm-evaluation": {
    tag: "Strategy",
    title: "Why Most Traders Fail Their Prop Firm Evaluation",
    excerpt: "The three most common reasons traders get disqualified — and how professional evaluation services eliminate these risks entirely.",
    date: "May 2025",
    readTime: "7 min read",
    content: `
      <h2>The Failure Rate Is Staggering</h2>
      <p>Industry data consistently shows that fewer than 10% of traders who attempt a prop firm evaluation pass on their first attempt. The reasons are predictable, repeatable, and almost entirely psychological.</p>
      <h2>Reason 1: Overleveraging Early</h2>
      <p>The most common failure mode is entering the challenge with oversized positions in the first few days. A single bad trade can end the evaluation before it begins.</p>
      <h2>Reason 2: Emotional Decision-Making</h2>
      <p>After an early loss, many traders attempt to recover quickly. This revenge trading mentality leads to compounding losses and rapid account breaches that are impossible to recover from.</p>
      <h2>Reason 3: Misunderstanding the Rules</h2>
      <p>The daily loss limit is calculated on your <em>initial balance</em>, not your current equity. Many traders discover this distinction only after a violation has already occurred.</p>
      <h2>How Professional Services Eliminate These Risks</h2>
      <p>When experienced traders execute your evaluation, these psychological factors are removed entirely. The process becomes mechanical — systematic entry, position sizing, and exit without emotional interference.</p>
    `,
  },
  "ftmo-vs-true-forex-funds": {
    tag: "Funding",
    title: "FTMO vs True Forex Funds: Which Prop Firm Is Right for You?",
    excerpt: "A side-by-side comparison of the two most popular prop firms — fees, rules, payout structures, and which suits different trading styles.",
    date: "April 2025",
    readTime: "9 min read",
    content: `
      <h2>Overview</h2>
      <p>FTMO and True Forex Funds are two of the most respected prop firms in the industry. Both offer funded accounts up to $200,000, but their structures differ in important ways.</p>
      <h2>Profit Targets</h2>
      <p>FTMO requires a <strong>10% Phase 1 target</strong> and 5% Phase 2. True Forex Funds requires <strong>8% Phase 1</strong> and 5% Phase 2 — making TFF's initial hurdle slightly lower.</p>
      <h2>Drawdown Rules</h2>
      <p>Both firms enforce a 5% daily loss limit and 10% maximum drawdown. However, FTMO uses a trailing drawdown from peak equity, while TFF uses the initial balance as the baseline.</p>
      <h2>Payout Splits</h2>
      <p>FTMO offers up to <strong>90% profit split</strong>. True Forex Funds starts at 75% and can scale to 80%. For high performers, FTMO's structure is more lucrative.</p>
      <h2>Which Should You Choose?</h2>
      <p>If you prefer lower initial profit targets and a simpler drawdown calculation, True Forex Funds is worth considering. If you want maximum payout potential and a well-established track record, FTMO remains the gold standard.</p>
    `,
  },
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export async function generateStaticParams() {
  const hardcodedSlugs = Object.keys(HARDCODED).map((slug) => ({ slug }));
  try {
    const supabase = await getSupabaseAdminClient();
    const { data } = await supabase.from("articles").select("slug").eq("published", true);
    const dbSlugs = (data ?? []).map((r) => ({ slug: r.slug }));
    const all = [...hardcodedSlugs];
    for (const s of dbSlugs) {
      if (!all.find((x) => x.slug === s.slug)) all.push(s);
    }
    return all;
  } catch {
    return hardcodedSlugs;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await getSupabaseAdminClient();
    const { data } = await supabase.from("articles").select("title, excerpt").eq("slug", slug).eq("published", true).single();
    if (data) return { title: `${data.title} — Eleusis FX`, description: data.excerpt ?? "", openGraph: { title: data.title, description: data.excerpt ?? "", type: "article" } };
  } catch {}
  const article = HARDCODED[slug];
  if (!article) return {};
  return { title: `${article.title} — Eleusis FX`, description: article.excerpt, openGraph: { title: article.title, description: article.excerpt, type: "article" } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let tag: string, title: string, date: string, readTime: string, content: string;

  try {
    const supabase = await getSupabaseAdminClient();
    const { data } = await supabase
      .from("articles")
      .select("category, title, excerpt, published_at, read_time, content")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (data) {
      tag = data.category ?? "Trading";
      title = data.title;
      date = formatDate(data.published_at);
      readTime = data.read_time ? `${data.read_time} min read` : "";
      content = data.content ?? "";
    } else {
      const h = HARDCODED[slug];
      if (!h) notFound();
      ({ tag, title, date, readTime, content } = h);
    }
  } catch {
    const h = HARDCODED[slug];
    if (!h) notFound();
    ({ tag, title, date, readTime, content } = h);
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 72 }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "80px 56px 120px" }}>
          <Link
            href="/articles"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)", textDecoration: "none", marginBottom: 48, transition: "color 0.2s" }}
          >
            ← Back to Articles
          </Link>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#4f8ef7", marginBottom: 24 }}>
            <span style={{ width: 16, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            {tag}
          </div>

          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 24 }}>
            {title}
          </h1>

          <div style={{ display: "flex", gap: 24, marginBottom: 60, paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>Eleusis FX</span>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.18)" }}>{date}</span>
            {readTime && <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.18)" }}>{readTime}</span>}
          </div>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </main>
      <Footer />

      <style>{`
        .article-body { font-size: 16px; line-height: 1.85; color: rgba(232,234,240,0.75); }
        .article-body h2 {
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 700; font-size: 24px; color: #e8eaf0;
          margin: 48px 0 20px; letter-spacing: -0.5px;
        }
        .article-body h3 {
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 600; font-size: 18px; color: #e8eaf0;
          margin: 32px 0 16px;
        }
        .article-body p { margin-bottom: 20px; }
        .article-body strong { color: #e8eaf0; font-weight: 600; }
        .article-body em { color: #7eb3ff; font-style: italic; }
        .article-body ul { list-style: none; padding: 0; margin-bottom: 20px; }
        .article-body ul li {
          padding: 10px 0 10px 28px; position: relative;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: rgba(232,234,240,0.6);
        }
        .article-body ul li::before {
          content: '→'; position: absolute; left: 0; color: #4f8ef7; font-size: 12px;
        }
        @media (max-width: 1024px) {
          article { padding: 60px 20px 80px !important; }
        }
      `}</style>
    </>
  );
}
