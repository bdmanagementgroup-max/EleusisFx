/**
 * Satori JSX template for a 1080×1080 Eleusis FX signal card.
 * Faithful port of the HTML card in SnapshotsClient, rebuilt with flexbox
 * (satori does not support CSS grid). Rendered to PNG by /api/signal-card.
 */

const SYNE = "Syne";
const MONO = "Space Mono";

const MUTED = "rgba(210,220,240,0.75)";
const FAINT = "rgba(210,220,240,0.35)";
const FAINTER = "rgba(210,220,240,0.25)";
const HAIR = "rgba(255,255,255,0.07)";

export interface CardSignal {
  pair: string;
  direction: string;
  session?: string | null;
  timeframe?: string | null;
  confluence?: string | null; // JSON string array
  entry_price?: string | null;
  stop_loss?: string | null;
  tp1?: string | null;
  tp2?: string | null;
  risk_reward?: string | null;
  invalidation?: string | null;
}

function parseBullets(confluence?: string | null): string[] {
  if (!confluence) return [];
  try {
    const arr = JSON.parse(confluence);
    return Array.isArray(arr) ? arr.map((b) => String(b)) : [];
  } catch {
    return [];
  }
}

function levelCell(label: string, value: string, colour: string) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${HAIR}`,
        padding: "24px 26px",
      }}
    >
      <div style={{ fontSize: 15, letterSpacing: 3, color: FAINT, marginBottom: 12 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: SYNE,
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: -1,
          color: colour,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function divider() {
  return <div style={{ height: 1, background: HAIR, margin: "28px 0" }} />;
}

export function signalCardElement(s: CardSignal, dateStr: string) {
  const isBuy = (s.direction ?? "").toUpperCase() === "BUY";
  const dirColour = isBuy ? "#22c55e" : "#ef4444";
  const dirBg = isBuy ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";
  const dirBorder = isBuy ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)";
  const arrow = isBuy ? "↑" : "↓";
  const bullets = parseBullets(s.confluence).slice(0, 3);

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        display: "flex",
        flexDirection: "column",
        background: "#08090f",
        fontFamily: MONO,
        color: MUTED,
        padding: "56px 64px 48px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            display: "flex",
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 6,
            color: "#e8eaf0",
          }}
        >
          ELEUSIS
          <span style={{ color: "#4f8ef7" }}>.</span>
          FX
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 13, letterSpacing: 1.5, color: "rgba(210,220,240,0.5)", marginBottom: 4 }}>
            {dateStr}
          </div>
          {s.session ? (
            <div style={{ fontSize: 12, letterSpacing: 2, color: "rgba(79,142,247,0.7)" }}>
              {`${s.session.toUpperCase()} SESSION`}
            </div>
          ) : null}
        </div>
      </div>

      {/* Pair + direction */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 44 }}>
        <div
          style={{
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 96,
            letterSpacing: -3,
            color: "#e8eaf0",
            lineHeight: 1,
          }}
        >
          {s.pair}
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 3,
            padding: "12px 24px",
            color: dirColour,
            background: dirBg,
            border: `1px solid ${dirBorder}`,
          }}
        >
          {s.direction.toUpperCase()} {arrow}
        </div>
      </div>
      {s.timeframe ? (
        <div style={{ fontSize: 14, letterSpacing: 2, color: FAINT, marginTop: 10 }}>
          {s.timeframe.toUpperCase()}
        </div>
      ) : null}

      {divider()}

      {/* Confluence */}
      {bullets.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: FAINTER, marginBottom: 16 }}>
            CONFLUENCE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", fontSize: 19, lineHeight: 1.5, color: MUTED }}>
                <span style={{ color: dirColour, marginRight: 12 }}>›</span>
                {b}
              </div>
            ))}
          </div>
          {divider()}
        </div>
      ) : null}

      {/* Levels */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", gap: 18 }}>
          {levelCell("ENTRY", s.entry_price ?? "", "#4f8ef7")}
          {levelCell("STOP LOSS", s.stop_loss ?? "", "#ef4444")}
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {levelCell("TP1", s.tp1 ?? "", "#22c55e")}
          {levelCell("TP2", s.tp2 ?? "", "#22c55e")}
        </div>
      </div>

      {/* Spacer pushes footer down */}
      <div style={{ display: "flex", flex: 1 }} />

      {divider()}

      {/* R:R + invalidation */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: FAINTER }}>R:R</div>
          <div style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 44, letterSpacing: -1, color: "#f59e0b" }}>
            {s.risk_reward ?? "—"}
          </div>
        </div>
        {s.invalidation ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: FAINTER, marginBottom: 6 }}>
              INVALIDATION
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.5, color: "rgba(210,220,240,0.45)" }}>
              {s.invalidation}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 32,
          paddingTop: 20,
          borderTop: `1px solid rgba(255,255,255,0.05)`,
          fontSize: 15,
          letterSpacing: 1,
        }}
      >
        <span style={{ color: "rgba(210,220,240,0.3)" }}>
          Not financial advice · Trade your own plan.
        </span>
        <span style={{ color: "rgba(79,142,247,0.5)" }}>#EleusisFx</span>
      </div>
    </div>
  );
}
