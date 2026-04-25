export default function CalendarPage() {
  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Macro Events</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1, marginBottom: 8 }}>
        Economic Calendar
      </h1>
      <p style={{ fontSize: 13, color: "rgba(232,234,240,0.38)", marginBottom: 48 }}>
        High-impact news events that affect forex and crypto markets.
      </p>

      <div
        style={{
          background: "#08090f",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
        <iframe
          src="https://sslecal2.investing.com?ecoDayBackground=%23020305&defaultFont=%23e8eaf0&innerBorderColor=%23ffffff10&borderColor=%23ffffff06&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_centralBanks,_gdp,_inflation&importance=3&lang=1&timezone=55&timeframe=custom&startTime=00:00&endTime=24:00&todayFill=%2308090f&tableBorderColor=%23ffffff06&tableHeaderBg=%2308090f&tableHeaderFontColor=%23e8eaf0&calRows=10&calWidth=100%&streaming=1"
          width="100%"
          height="600"
          style={{ border: "none", display: "block", background: "#020305" }}
          title="Economic Calendar"
        />
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: "rgba(232,234,240,0.18)", letterSpacing: "0.5px" }}>
        Data provided by Investing.com. High-impact events only.
      </p>
    </div>
  );
}
