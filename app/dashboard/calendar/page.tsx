import EconomicCalendarWidget from "@/components/calendar/EconomicCalendarWidget";

export default function CalendarPage() {
  return (
    <div style={{ padding: "40px 40px 80px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4f8ef7", marginBottom: 8 }}>Macro Events</div>
      <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1, marginBottom: 8 }}>
        Economic Calendar
      </h1>
      <p style={{ fontSize: 13, color: "rgba(210,220,240,0.88)", marginBottom: 48 }}>
        High-impact news events that affect forex and crypto markets.
      </p>

      <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #4f8ef7 40%, transparent)" }} />
        <EconomicCalendarWidget />
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: "rgba(210,220,240,0.58)", letterSpacing: "0.5px" }}>
        Data provided by TradingView · High-impact events only · Times shown in your local timezone
      </p>
    </div>
  );
}
