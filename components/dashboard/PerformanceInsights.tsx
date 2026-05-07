"use client";

import useSWR from "swr";

interface InsightsResponse {
  insights: string[];
}

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<InsightsResponse>);

export default function PerformanceInsights() {
  const { data, isLoading } = useSWR<InsightsResponse>(
    "/api/dashboard/insights",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  const insights = data?.insights ?? [];

  if (!isLoading && insights.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "#08090f",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 28px",
        marginTop: 16,
      }}
    >
      <style>{`
        @keyframes pi-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .pi-skeleton {
          animation: pi-pulse 1.6s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#4f8ef7",
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontWeight: 700,
          }}
        >
          AI Insights
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(79,142,247,0.08)",
            border: "1px solid rgba(79,142,247,0.18)",
            padding: "3px 10px",
          }}
        >
          <span
            style={{
              color: "#4f8ef7",
              fontSize: 10,
              lineHeight: 1,
            }}
          >
            ✦
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#4f8ef7",
              fontWeight: 600,
            }}
          >
            Live
          </span>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          marginBottom: 20,
        }}
      />

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[70, 85, 60].map((w, i) => (
            <div
              key={i}
              className="pi-skeleton"
              style={{
                height: 12,
                width: `${w}%`,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {insights.map((insight, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span
                style={{
                  color: "#4f8ef7",
                  fontSize: 12,
                  lineHeight: "18px",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                →
              </span>
              <span
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "rgba(210,220,240,0.88)",
                }}
              >
                {insight}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
