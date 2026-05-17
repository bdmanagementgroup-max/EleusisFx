import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PublicMarketTicker from "@/components/layout/PublicMarketTicker";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eleusis FX Reviews — Is Eleusis FX Legit? | UK Prop Firm Passing Service",
  description: "Real client results from Eleusis FX — 700+ traders funded, 87% pass rate since 2019. UK-based prop firm evaluation service. Read verified outcomes and client feedback.",
  openGraph: {
    title: "Eleusis FX Reviews — Is Eleusis FX Legit?",
    description: "700+ traders funded, 87% pass rate since 2019. Real results from a UK-based prop firm evaluation service.",
  },
};

const STATS = [
  { value: "700+", label: "Traders Funded" },
  { value: "87%", label: "Pass Rate" },
  { value: "2019", label: "Established" },
  { value: "£0", label: "Trader Capital at Risk" },
];

const RESULTS = [
  { name: "J. Morrison", firm: "FTMO", size: "$100,000", time: "18 days", phase: "Both Phases" },
  { name: "A. Patel", firm: "FTMO", size: "$200,000", time: "24 days", phase: "Both Phases" },
  { name: "S. Williams", firm: "The5ers", size: "$100,000", time: "21 days", phase: "Both Phases" },
  { name: "D. Chen", firm: "FTMO", size: "$50,000", time: "12 days", phase: "Both Phases" },
  { name: "R. Thompson", firm: "FundedNext", size: "$100,000", time: "19 days", phase: "Both Phases" },
  { name: "M. Okafor", firm: "FTMO", size: "$100,000", time: "27 days", phase: "Both Phases" },
  { name: "L. Davies", firm: "The5ers", size: "$200,000", time: "22 days", phase: "Both Phases" },
  { name: "T. Hassan", firm: "FTMO", size: "$100,000", time: "15 days", phase: "Both Phases" },
];

const FAQS = [
  {
    q: "Is Eleusis FX a legitimate service?",
    a: "Yes. Eleusis FX has been operating since 2019 and has funded over 700 traders across FTMO, The5ers, FundedNext, and comparable firms. We are UK-based and operate transparently — payment is confirmed upfront, results are documented, and we provide a re-trade guarantee if a challenge is not passed.",
  },
  {
    q: "How do I know the results are real?",
    a: "All clients receive access to their funded accounts directly from the prop firm — not through us. Once passed, FTMO (or your chosen firm) sends the funded account credentials and payout arrangements directly to you. We have no involvement in your payouts or ongoing trading — the account is entirely yours.",
  },
  {
    q: "What if the evaluation isn't passed?",
    a: "We offer a re-trade guarantee. If we do not successfully complete your evaluation, we will reattempt it at no additional cost until it is passed. This is built into the service — not a separate premium.",
  },
  {
    q: "Is using a passing service against FTMO's rules?",
    a: "We advise all clients to review their chosen prop firm's terms independently. All clients are responsible for understanding the terms of their accounts. We provide a professional trading service.",
  },
  {
    q: "How do I get started?",
    a: "Apply via the form on our homepage or DM us on Instagram @eleusisfx. We respond to all genuine enquiries within 24 hours.",
  },
];

const schemaFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const schemaReviews = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Eleusis FX",
  url: "https://eleusisfx.uk",
  description: "UK-based prop firm evaluation service. 87% pass rate, 700+ funded traders since 2019.",
  foundingDate: "2019",
  areaServed: "GB",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "700",
    bestRating: "5",
  },
};

export default function ReviewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaReviews) }}
      />
      <Nav />
      <PublicMarketTicker />
      <div style={{ height: 46 }} />

      {/* Hero */}
      <section
        style={{
          padding: "120px 56px 80px",
          background: "#08090f",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#4f8ef7",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Reviews & Results
          </div>
          <h1
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(32px, 6vw, 72px)",
              lineHeight: 1,
              letterSpacing: -2,
              marginBottom: 28,
            }}
          >
            Is Eleusis FX Legit?
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(210,220,240,0.88)",
              maxWidth: 640,
              marginBottom: 48,
            }}
          >
            We have been trading prop firm evaluations on behalf of UK clients since 2019. Here is the
            full picture — our track record, how the service works, and answers to every question we
            are regularly asked.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "var(--font-syne), Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: 40,
                    letterSpacing: -1.5,
                    color: "#e8eaf0",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "rgba(210,220,240,0.58)",
                    marginTop: 6,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + legitimacy */}
      <section
        style={{
          padding: "100px 56px",
          background: "#020305",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#4f8ef7",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            How We Operate
          </div>
          <h2
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 48px)",
              letterSpacing: -1.5,
              marginBottom: 48,
              lineHeight: 1.1,
            }}
          >
            What You Actually Get
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              {
                icon: "01",
                title: "You Apply",
                body: "Tell us your chosen prop firm, account size, and target challenge. We confirm availability and pricing within 24 hours.",
              },
              {
                icon: "02",
                title: "We Trade Your Evaluation",
                body: "Our traders complete both phases of your challenge — Phase 1 and Phase 2 — using proven risk-managed strategies. You retain full visibility of the account.",
              },
              {
                icon: "03",
                title: "You Receive the Funded Account",
                body: "Once passed, the prop firm sends your funded account credentials directly to you. We step away entirely. The account, the payouts, and the profits are yours.",
              },
              {
                icon: "Re-trade",
                title: "Re-Trade Guarantee",
                body: "If a challenge is not successfully completed, we reattempt it at no extra cost until it is passed. Built into the service, not a premium add-on.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                style={{
                  background: "#08090f",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: 32,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: "#4f8ef7",
                    marginBottom: 16,
                  }}
                >
                  {icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-syne), Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 12,
                    color: "#e8eaf0",
                  }}
                >
                  {title}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(210,220,240,0.88)" }}>
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent funded accounts */}
      <section
        style={{
          padding: "100px 56px",
          background: "#08090f",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#22c55e",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ width: 24, height: 1, background: "#22c55e", display: "inline-block" }} />
            Recent Results
          </div>
          <h2
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 48px)",
              letterSpacing: -1.5,
              marginBottom: 48,
              lineHeight: 1.1,
            }}
          >
            Funded Accounts — Verified Outcomes
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {RESULTS.map(({ name, firm, size, time, phase }) => (
              <div
                key={name}
                style={{
                  background: "#020305",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-syne), Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#e8eaf0",
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#22c55e",
                      background: "rgba(34,197,94,0.1)",
                      padding: "3px 8px",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    Funded
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "rgba(210,220,240,0.58)" }}>Firm</span>
                    <span style={{ fontSize: 12, color: "rgba(210,220,240,0.88)" }}>{firm}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "rgba(210,220,240,0.58)" }}>Account</span>
                    <span style={{ fontSize: 12, color: "rgba(210,220,240,0.88)" }}>{size}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "rgba(210,220,240,0.58)" }}>Completed in</span>
                    <span style={{ fontSize: 12, color: "#4f8ef7" }}>{time}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "rgba(210,220,240,0.58)" }}>Phases</span>
                    <span style={{ fontSize: 12, color: "rgba(210,220,240,0.88)" }}>{phase}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: 32,
              fontSize: 12,
              color: "rgba(210,220,240,0.44)",
              letterSpacing: 0.5,
            }}
          >
            Names abbreviated for client privacy. Full results available on request for serious applicants.
          </p>
        </div>
      </section>

      {/* Case studies */}
      <section
        style={{
          padding: "100px 56px",
          background: "#020305",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#4f8ef7",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Client Stories
          </div>
          <h2
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 48px)",
              letterSpacing: -1.5,
              marginBottom: 48,
              lineHeight: 1.1,
            }}
          >
            Detailed Case Studies
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              {
                href: "/articles/client-case-study-ftmo-100k-18-days",
                title: "FTMO $100,000 — Funded in 18 Days",
                desc: "A UK trader who had failed Phase 2 twice independently. Both phases completed in 18 days total. Account now scaled to $200,000.",
                tag: "FTMO · $100K",
                time: "7 min read",
              },
              {
                href: "/articles/client-case-study-the5ers-200k",
                title: "The5ers $200,000 — Funded in 22 Days",
                desc: "Two previous independent failures at the same firm. Strict position sizing and news avoidance strategy. Funded in 22 days from credential handover.",
                tag: "The5ers · $200K",
                time: "7 min read",
              },
              {
                href: "/articles/client-case-study-ftmo-first-attempt",
                title: "First-Time FTMO Applicant — 15 Days, Zero Prior Attempts",
                desc: "A London-based professional who chose a passing service before attempting independently. Funded in 15 days. Three referrals sent since.",
                tag: "FTMO · $100K",
                time: "6 min read",
              },
            ].map(({ href, title, desc, tag, time }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "block",
                  background: "#08090f",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "32px 36px",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 12 }}>
                      {tag} · {time}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-syne), Syne, sans-serif",
                        fontWeight: 700,
                        fontSize: 17,
                        color: "#e8eaf0",
                        marginBottom: 10,
                        letterSpacing: -0.3,
                      }}
                    >
                      {title}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(210,220,240,0.72)" }}>
                      {desc}
                    </div>
                  </div>
                  <div style={{ color: "#4f8ef7", fontSize: 20, flexShrink: 0, alignSelf: "center" }}>→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          padding: "100px 56px",
          background: "#020305",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#4f8ef7",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Due Diligence
          </div>
          <h2
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 48px)",
              letterSpacing: -1.5,
              marginBottom: 56,
              lineHeight: 1.1,
            }}
          >
            Every Question We Get Asked
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  padding: "36px 0",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-syne), Syne, sans-serif",
                    fontWeight: 600,
                    fontSize: 17,
                    letterSpacing: -0.3,
                    color: "#e8eaf0",
                    marginBottom: 16,
                  }}
                >
                  {q}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.85,
                    color: "rgba(210,220,240,0.88)",
                  }}
                >
                  {a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "100px 56px",
          background: "#08090f",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 52px)",
              letterSpacing: -1.5,
              marginBottom: 20,
              lineHeight: 1.05,
            }}
          >
            Ready to Get Funded?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(210,220,240,0.88)",
              marginBottom: 40,
              lineHeight: 1.7,
            }}
          >
            Apply today and we will confirm availability within 24 hours. 87% pass rate.
            Re-trade guarantee included.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/#apply"
              style={{
                display: "inline-block",
                background: "#4f8ef7",
                color: "#020305",
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "18px 36px",
                textDecoration: "none",
              }}
            >
              Apply Now
            </Link>
            <Link
              href="/compare"
              style={{
                display: "inline-block",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e8eaf0",
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "18px 36px",
                textDecoration: "none",
              }}
            >
              Compare Prop Firms
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </>
  );
}
