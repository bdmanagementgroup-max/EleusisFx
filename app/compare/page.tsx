import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PublicMarketTicker from "@/components/layout/PublicMarketTicker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prop Firm Comparison — Eleusis FX",
  description: "Side-by-side comparison of FTMO, True Forex Funds, The5ers, E8 Funding, and FundingNext. Rules, fees, payout splits, and our verdict.",
};

const FIRMS = [
  {
    name: "FTMO",
    badge: "Most Popular",
    badgeColor: "#4f8ef7",
    recommended: true,
    fee: "£155",
    phase1Target: "10%",
    phase2Target: "5%",
    dailyLoss: "5%",
    maxDrawdown: "10%",
    profitSplit: "Up to 90%",
    minDays: "4 days",
    phase1Limit: "30 days",
    phase2Limit: "60 days",
    sizes: "$10K–$200K",
    newsTrading: true,
    weekendHolding: true,
    verdict: "Gold standard. Highest payouts, best reputation, strict but fair rules.",
    verdictColor: "#22c55e",
  },
  {
    name: "True Forex Funds",
    badge: "Easiest Rules",
    badgeColor: "#22c55e",
    recommended: false,
    fee: "£119",
    phase1Target: "8%",
    phase2Target: "5%",
    dailyLoss: "5%",
    maxDrawdown: "10%",
    profitSplit: "Up to 80%",
    minDays: "3 days",
    phase1Limit: "30 days",
    phase2Limit: "60 days",
    sizes: "$10K–$200K",
    newsTrading: true,
    weekendHolding: true,
    verdict: "Lower profit target, simpler drawdown rules. Good for first-time challengers.",
    verdictColor: "#22c55e",
  },
  {
    name: "The5ers",
    badge: "Low Risk",
    badgeColor: "#f59e0b",
    recommended: false,
    fee: "£95",
    phase1Target: "6%",
    phase2Target: "6%",
    dailyLoss: "4%",
    maxDrawdown: "5%",
    profitSplit: "Up to 100%",
    minDays: "None",
    phase1Limit: "Unlimited",
    phase2Limit: "Unlimited",
    sizes: "$5K–$100K",
    newsTrading: false,
    weekendHolding: true,
    verdict: "Tightest max drawdown. Best for conservative, low-risk traders.",
    verdictColor: "#f59e0b",
  },
  {
    name: "E8 Funding",
    badge: "Flexible",
    badgeColor: "#a78bfa",
    recommended: false,
    fee: "£128",
    phase1Target: "8%",
    phase2Target: "5%",
    dailyLoss: "5%",
    maxDrawdown: "8%",
    profitSplit: "Up to 80%",
    minDays: "None",
    phase1Limit: "Unlimited",
    phase2Limit: "Unlimited",
    sizes: "$25K–$300K",
    newsTrading: true,
    weekendHolding: true,
    verdict: "No time limits and large account sizes. Good for patient, systematic traders.",
    verdictColor: "#a78bfa",
  },
  {
    name: "FundingNext",
    badge: "Best Value",
    badgeColor: "#fb923c",
    recommended: false,
    fee: "£79",
    phase1Target: "10%",
    phase2Target: "5%",
    dailyLoss: "5%",
    maxDrawdown: "10%",
    profitSplit: "Up to 90%",
    minDays: "5 days",
    phase1Limit: "45 days",
    phase2Limit: "90 days",
    sizes: "$15K–$200K",
    newsTrading: true,
    weekendHolding: false,
    verdict: "Lowest fees with competitive payouts. Weekend holding restriction is the main trade-off.",
    verdictColor: "#fb923c",
  },
];

const ROWS: { label: string; key: keyof typeof FIRMS[0]; hint?: string }[] = [
  { label: "Challenge Fee", key: "fee", hint: "Approximate for ~$100K account" },
  { label: "Phase 1 Target", key: "phase1Target" },
  { label: "Phase 2 Target", key: "phase2Target" },
  { label: "Daily Loss Limit", key: "dailyLoss" },
  { label: "Max Drawdown", key: "maxDrawdown" },
  { label: "Profit Split", key: "profitSplit" },
  { label: "Min Trading Days", key: "minDays" },
  { label: "Phase 1 Time Limit", key: "phase1Limit" },
  { label: "Phase 2 Time Limit", key: "phase2Limit" },
  { label: "Account Sizes", key: "sizes" },
];

function YesNo({ val }: { val: boolean }) {
  return (
    <span style={{ fontSize: 13, fontWeight: 700, color: val ? "#22c55e" : "#ef4444" }}>
      {val ? "✓" : "✗"}
    </span>
  );
}

export default function ComparePage() {
  return (
    <>
      <Nav />
      <PublicMarketTicker />
      <div style={{ height: 38 }} />
      <main style={{ paddingTop: 72, background: "#020305", minHeight: "100vh" }}>

        {/* Header */}
        <section style={{ padding: "60px 56px 48px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Prop Firm Comparison
          </div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: -2, marginBottom: 20 }}>
            Which Prop Firm<br />Is Right for You?
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(232,234,240,0.45)", maxWidth: 580 }}>
            Side-by-side breakdown of the 5 most popular prop firms — rules, fees, payout structures, and our honest verdict on each.
          </p>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: "0 56px 40px", position: "relative", zIndex: 1, overflowX: "auto" }}>
          <div style={{ minWidth: 900 }}>

            {/* Firm headers */}
            <div style={{ display: "grid", gridTemplateColumns: "220px repeat(5, 1fr)", gap: 1, marginBottom: 1 }}>
              <div style={{ background: "#08090f", padding: "24px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,234,240,0.25)" }}>Comparing</div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "rgba(232,234,240,0.38)" }}>5 Firms</div>
              </div>
              {FIRMS.map((firm) => (
                <div
                  key={firm.name}
                  style={{
                    background: firm.recommended ? "#08090f" : "#08090f",
                    border: firm.recommended ? "1px solid rgba(79,142,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    padding: "20px 20px 24px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {firm.recommended && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #4f8ef7, transparent)" }} />
                  )}
                  <div style={{ display: "inline-flex", alignItems: "center", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: firm.badgeColor, background: `${firm.badgeColor}12`, border: `1px solid ${firm.badgeColor}30`, padding: "3px 8px", marginBottom: 12 }}>
                    {firm.badge}
                  </div>
                  <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.3, color: "#e8eaf0" }}>
                    {firm.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {ROWS.map(({ label, key, hint }, rowIdx) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "220px repeat(5, 1fr)", gap: 1, marginBottom: 1 }}>
                <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,234,240,0.5)", fontWeight: 600 }}>{label}</div>
                  {hint && <div style={{ fontSize: 10, color: "rgba(232,234,240,0.2)", marginTop: 4, lineHeight: 1.4 }}>{hint}</div>}
                </div>
                {FIRMS.map((firm) => (
                  <div
                    key={firm.name}
                    style={{
                      background: rowIdx % 2 === 0 ? "#08090f" : "#060810",
                      border: firm.recommended ? "1px solid rgba(79,142,247,0.2)" : "1px solid rgba(255,255,255,0.04)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 13, color: "#e8eaf0" }}>
                      {String(firm[key])}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* Yes/No rows */}
            {[
              { label: "News Trading", key: "newsTrading" as const },
              { label: "Weekend Holding", key: "weekendHolding" as const },
            ].map(({ label, key }, rowIdx) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "220px repeat(5, 1fr)", gap: 1, marginBottom: 1 }}>
                <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", display: "flex", alignItems: "center" }}>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,234,240,0.5)", fontWeight: 600 }}>{label}</div>
                </div>
                {FIRMS.map((firm) => (
                  <div
                    key={firm.name}
                    style={{
                      background: (ROWS.length + rowIdx) % 2 === 0 ? "#08090f" : "#060810",
                      border: firm.recommended ? "1px solid rgba(79,142,247,0.2)" : "1px solid rgba(255,255,255,0.04)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <YesNo val={firm[key] as boolean} />
                  </div>
                ))}
              </div>
            ))}

            {/* Verdict row */}
            <div style={{ display: "grid", gridTemplateColumns: "220px repeat(5, 1fr)", gap: 1, marginTop: 1 }}>
              <div style={{ background: "#0d1020", border: "1px solid rgba(255,255,255,0.06)", padding: "20px 20px", display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f8ef7", fontWeight: 700 }}>Our Verdict</div>
              </div>
              {FIRMS.map((firm) => (
                <div
                  key={firm.name}
                  style={{
                    background: "#0d1020",
                    border: firm.recommended ? "1px solid rgba(79,142,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    padding: "20px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {firm.recommended && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #4f8ef7, transparent)" }} />
                  )}
                  <div style={{ width: 24, height: 2, background: firm.verdictColor, marginBottom: 10 }} />
                  <p style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(232,234,240,0.55)", margin: 0 }}>{firm.verdict}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 16, fontSize: 11, color: "rgba(232,234,240,0.2)", letterSpacing: "0.5px" }}>
            Data accurate as of April 2026. Fees are approximate for a $100K account. Always verify current rules at the firm's official site before purchasing.
          </p>
        </section>

        {/* Bottom CTA */}
        <section style={{ padding: "40px 56px 120px", position: "relative", zIndex: 1 }}>
          <div style={{ background: "#08090f", border: "1px solid rgba(79,142,247,0.2)", padding: "56px 48px", position: "relative", overflow: "hidden", maxWidth: 860 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 16 }}>Don't go it alone</div>
            <h2 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 40px)", lineHeight: 1.1, letterSpacing: -1, marginBottom: 20 }}>
              We handle the evaluation.<br />You keep the profits.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(232,234,240,0.45)", maxWidth: 520, marginBottom: 36 }}>
              Eleusis FX has passed 700+ prop firm evaluations across FTMO, True Forex Funds, FundingNext and more. We know every firm's rules inside out — and we know how to pass them.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a href="/#apply" style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#020305", background: "#e8eaf0", padding: "16px 32px", textDecoration: "none", transition: "all 0.2s", display: "inline-block" }}>
                Apply Now →
              </a>
              <a href="/articles" style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(232,234,240,0.5)", border: "1px solid rgba(255,255,255,0.12)", padding: "16px 32px", textDecoration: "none", transition: "all 0.2s", display: "inline-block" }}>
                Read the Guides
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </>
  );
}
