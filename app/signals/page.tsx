import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import StripeButton from "./StripeButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signals — Eleusis FX",
  description: "Professional daily trading signals from AI-powered technical analysis. Hand-picked setups with strict confluence rules.",
};

const SAMPLE_SIGNAL = `## GBP/USD — Long (D-Chart Breakout)

**Setup:** H4 base + D reversal + 4H momentum align
**Entry:** 1.2780 (above prior high)
**SL:** 1.2710 (below support)
**Target:** 1.2850 (1:1 risk/reward)
**Confluence:** 
- D-chart: reversed below 1.2750, now closing above it (strength)
- H4: aligned impulse, clean support at 1.2710
- 4H: RSI 55→65, momentum building
- Structure: Higher high setup, 18-pip SL = tradeable size

---

## BTC — Neutral (Consolidation Mode)

ATR 800, ranging 43.5k–44.2k. No signal until daily close above/below range.`;

export default function SignalsPage() {
  return (
    <>
      <Nav />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Hero */}
        <section
          style={{
            padding: "120px 56px 60px",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(79,142,247,0.05) 0%, rgba(79,142,247,0.02) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 300,
              height: 300,
              background: "radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20 }}>
              Premium Signals
            </div>
            <h1
              style={{
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(36px, 6vw, 72px)",
                lineHeight: 1.1,
                letterSpacing: -1.5,
                marginBottom: 32,
                background: "linear-gradient(to right, #fff, rgba(210,220,240,0.8))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Daily Trading Signals
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(210,220,240,0.88)", marginBottom: 16, maxWidth: 600, margin: "0 auto 32px" }}>
              Real-time, hand-picked setups from AI-powered technical analysis. Strict confluence rules, actionable entries, clear risk management.
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section
          style={{
            padding: "80px 56px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "start",
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Left: What You Get */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-syne), Syne, sans-serif",
                fontWeight: 700,
                fontSize: 32,
                lineHeight: 1.2,
                marginBottom: 36,
              }}
            >
              What You Receive
            </h2>

            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 13, color: "#4f8ef7", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                Daily Analysis
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(210,220,240,0.88)" }}>
                Each trading session (London, New York, Asia), receive updated signals from our AI analysis engine scanning 12+ forex pairs + major cryptos.
              </p>
            </div>

            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 13, color: "#4f8ef7", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                Strict Confluence
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(210,220,240,0.88)" }}>
                Only pairs with 3+ signal alignment make the cut: technical structure + momentum + macro context. No noise, no over-trading.
              </p>
            </div>

            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 13, color: "#4f8ef7", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                Tradeable Risk Management
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(210,220,240,0.88)" }}>
                Every setup includes entry, stop loss, and target. Risk/reward ratios 1:1 minimum. Sized for real money, not casino trades.
              </p>
            </div>

            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 13, color: "#4f8ef7", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                Telegram Community
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(210,220,240,0.88)" }}>
                Private subscribers-only channel. Real-time updates, signal alerts, and a community of serious traders using the same setups.
              </p>
            </div>
          </div>

          {/* Right: Sample Signal + Pricing */}
          <div>
            {/* Sample Signal Card */}
            <div
              style={{
                background: "#08090f",
                border: "1px solid rgba(79,142,247,0.3)",
                borderRadius: 8,
                padding: 36,
                marginBottom: 48,
                position: "relative",
              }}
            >
              <div style={{ fontSize: 11, color: "#7eb3ff", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
                Sample Signal (May 8, 2026)
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: "rgba(210,220,240,0.88)",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {SAMPLE_SIGNAL}
              </div>
            </div>

            {/* Pricing Card */}
            <div
              style={{
                background: "#08090f",
                border: "2px solid #4f8ef7",
                borderRadius: 8,
                padding: "48px 40px",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 11, color: "#4f8ef7", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
                Monthly Subscription
              </div>
              <div
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 800,
                  marginBottom: 4,
                  color: "#fff",
                }}
              >
                £29
              </div>
              <p style={{ fontSize: 12, color: "rgba(210,220,240,0.7)", marginBottom: 32, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                Billed monthly, cancel anytime
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <StripeButton />
              </div>

              <p style={{ fontSize: 11, color: "rgba(210,220,240,0.6)", marginTop: 24 }}>
                No card required to browse. Secure checkout powered by Stripe.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ / Features */}
        <section style={{ padding: "80px 56px", background: "rgba(79,142,247,0.02)" }}>
          <h2
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.2,
              marginBottom: 60,
              textAlign: "center",
            }}
          >
            Frequently Asked
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            {[
              { q: "How often do signals post?", a: "3 times daily (London, New York, Asia sessions). You'll receive alerts in our private Telegram channel." },
              { q: "What about false signals?", a: "We only post setups with strict 3+ signal confluence. False signals happen, but our approach minimizes them. Track your stats in the subscriber dashboard." },
              { q: "Can I use these with prop firm challenges?", a: "Absolutely. Many Eleusis clients use these signals as part of their challenge trading. Always respect your firm's rules." },
              { q: "Refund policy?", a: "7-day money-back guarantee. If the signals don't match your style after 7 days, we'll refund you, no questions." },
            ].map((item, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{item.q}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(210,220,240,0.8)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
