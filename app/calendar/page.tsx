import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PublicMarketTicker from "@/components/layout/PublicMarketTicker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Economic Calendar — Eleusis FX",
  description: "High-impact forex and crypto economic events — central banks, GDP, inflation, and employment data.",
};

export default function CalendarPage() {
  return (
    <>
      <Nav />
      <PublicMarketTicker />
      <div style={{ height: 38 }} />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "60px 56px 40px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 24, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            Macro Events
          </div>
          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5vw, 60px)", lineHeight: 0.95, letterSpacing: -2, marginBottom: 16 }}>
            Economic Calendar
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(232,234,240,0.38)", maxWidth: 520, marginBottom: 0 }}>
            High-impact news events affecting forex and crypto markets. Plan your trades around the data releases that move price.
          </p>
        </section>

        <section style={{ padding: "0 56px 120px", position: "relative", zIndex: 1 }}>
          <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
            <iframe
              src="https://sslecal2.investing.com?ecoDayBackground=%23020305&defaultFont=%23e8eaf0&innerBorderColor=%23ffffff10&borderColor=%23ffffff06&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_centralBanks,_gdp,_inflation&importance=3&lang=1&timezone=55&timeframe=custom&startTime=00:00&endTime=24:00&todayFill=%2308090f&tableBorderColor=%23ffffff06&tableHeaderBg=%2308090f&tableHeaderFontColor=%23e8eaf0&calRows=15&calWidth=100%&streaming=1"
              width="100%"
              height="680"
              style={{ border: "none", display: "block", background: "#020305" }}
              title="Economic Calendar"
            />
          </div>
          <p style={{ marginTop: 14, fontSize: 11, color: "rgba(232,234,240,0.18)", letterSpacing: "0.5px" }}>
            Data provided by Investing.com · High-impact events only · Times shown in your local timezone
          </p>
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
