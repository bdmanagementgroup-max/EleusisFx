import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources — Eleusis FX",
  description: "Prop firm comparison guides, trading tools, calculators, and downloadable guides for funded traders.",
};

const RESOURCES = {
  "Prop Firm Comparison Guides": [
    { title: "FTMO vs True Forex Funds", description: "Side-by-side comparison of rules, profit splits, fees, and payout structures.", href: "/articles/ftmo-vs-true-forex-funds" },
    { title: "What Is an FTMO Challenge?", description: "Complete breakdown of phases, rules, drawdown limits, and evaluation structure.", href: "/articles/what-is-an-ftmo-challenge" },
    { title: "Why Traders Fail Evaluations", description: "The three most common failure patterns and how to avoid them.", href: "/articles/why-traders-fail-prop-firm-evaluation" },
  ],
  "Trading Tools & Calculators": [
    { title: "Position Size Calculator", description: "Calculate your lot size based on account balance, risk %, and stop loss pips.", href: "/resources/position-size-calculator" },
    { title: "Risk/Reward Calculator", description: "Quickly calculate R:R ratios and potential profit vs. loss for any trade.", href: "/resources/risk-reward-calculator" },
    { title: "Drawdown Tracker", description: "Track your daily and max drawdown against FTMO limits in real-time.", href: "/resources/drawdown-tracker" },
  ],
  "Downloadable Guides": [
    { title: "5 Fatal Mistakes Guide (PDF)", description: "The most common prop firm evaluation mistakes — and exactly how to avoid them.", href: "/#free-guide", download: true },
  ],
};

export default function ResourcesPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "100px 56px 60px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Resources
          </div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 0.95, letterSpacing: -2, marginBottom: 24 }}>
            Tools &amp; Guides
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(232,234,240,0.38)", maxWidth: 560 }}>
            Everything you need to understand prop firm trading — comparison guides, calculators, and free downloads.
          </p>
        </section>

        {Object.entries(RESOURCES).map(([category, items]) => (
          <section key={category} style={{ padding: "0 56px 80px", position: "relative", zIndex: 1 }}>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 60, marginBottom: 40 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
                {category}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {items.map(({ title, description, href, ...rest }) => {
                const download = "download" in rest ? (rest as any).download : false;
                return (
                <a
                  key={title}
                  href={href}
                  className="resource-card"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {download && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 9, letterSpacing: 2, textTransform: "uppercase" as const, color: "#22c55e", marginBottom: 16, padding: "4px 10px", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
                      ↓ Free Download
                    </div>
                  )}
                  <h3 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 18, lineHeight: 1.3, letterSpacing: -0.3, marginBottom: 12, color: "#e8eaf0", transition: "color 0.2s" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(232,234,240,0.38)" }}>{description}</p>
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
                    <span className="resource-arrow" style={{ fontSize: 12, color: "rgba(232,234,240,0.18)", transition: "all 0.2s" }}>→</span>
                  </div>
                </a>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <Footer />

      <style>{`
        .resource-card {
          background: #08090f; border: 1px solid rgba(255,255,255,0.06);
          padding: 32px 28px; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .resource-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #4f8ef7, transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .resource-card:hover { border-color: rgba(79,142,247,0.3); transform: translateY(-4px); }
        .resource-card:hover::before { opacity: 1; }
        .resource-card:hover h3 { color: #7eb3ff; }
        .resource-card:hover .resource-arrow { color: #4f8ef7; transform: translateX(4px); }
        @media (max-width: 1024px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
