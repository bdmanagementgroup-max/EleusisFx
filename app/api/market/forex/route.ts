import { NextResponse } from "next/server";

export const revalidate = 60;

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "GBP/JPY"];

export async function GET() {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) throw new Error("No API key");

    const symbols = PAIRS.join(",");
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) throw new Error("Twelve Data error");
    const raw = await res.json();

    const rates = PAIRS.map((symbol) => {
      const key = symbol.replace("/", "/");
      const entry = raw[symbol] ?? raw[key];
      return {
        symbol,
        price: entry?.price ?? "0",
        change: undefined,
      };
    });

    return NextResponse.json({ rates }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } });
  } catch {
    return NextResponse.json({ rates: [] });
  }
}
