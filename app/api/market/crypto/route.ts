import { NextResponse } from "next/server";

export const revalidate = 60;

const COINS = "bitcoin,ethereum,ripple,solana,litecoin";
const SYMBOLS: Record<string, string> = {
  bitcoin: "BTC", ethereum: "ETH", ripple: "XRP", solana: "SOL", litecoin: "LTC",
};

export async function GET() {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINS}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) throw new Error("CoinGecko error");
    const raw = await res.json();

    const prices = Object.entries(raw).map(([id, data]: [string, any]) => ({
      id,
      symbol: SYMBOLS[id] ?? id.toUpperCase(),
      usd: data.usd,
      usd_24h_change: data.usd_24h_change ?? 0,
    }));

    return NextResponse.json({ prices }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } });
  } catch {
    // Return fallback stub so the UI doesn't break
    return NextResponse.json({ prices: [] });
  }
}
