import { NextResponse } from "next/server";

export const revalidate = 60;

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "GBP/JPY"];

async function fetchQuote(symbols: string, apiKey: string) {
  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  const raw = await res.json();
  // Twelve Data returns { status: "error" } if the market is closed or key is invalid
  if (raw.status === "error") return null;
  return raw;
}

async function fetchPrice(symbols: string, apiKey: string) {
  const res = await fetch(
    `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) throw new Error("No API key");

    const symbols = PAIRS.join(",");

    // Try /quote first — gives price + percent_change
    const quoteRaw = await fetchQuote(symbols, apiKey);

    if (quoteRaw) {
      const rates = PAIRS.map((symbol) => {
        const entry = quoteRaw[symbol];
        const price = entry?.close ?? entry?.previous_close ?? "0";
        const change = entry?.percent_change != null ? parseFloat(entry.percent_change) : undefined;
        return { symbol, price, change };
      });
      // If all prices are "0" or missing, the quote endpoint failed silently — fall through
      if (rates.some((r) => parseFloat(r.price) > 0)) {
        return NextResponse.json({ rates }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } });
      }
    }

    // Fallback to /price (always works, no change data)
    const priceRaw = await fetchPrice(symbols, apiKey);
    if (!priceRaw) throw new Error("Both endpoints failed");

    const rates = PAIRS.map((symbol) => ({
      symbol,
      price: priceRaw[symbol]?.price ?? "0",
      change: undefined,
    }));

    return NextResponse.json({ rates }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } });
  } catch {
    return NextResponse.json({ rates: [] });
  }
}
