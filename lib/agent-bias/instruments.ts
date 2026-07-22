import { FOREX_PAIRS, CRYPTO_PAIRS } from "@/lib/trading/indicators";

export interface Instrument {
  display: string;
  yahoo: string;
  assetType: "forex" | "crypto";
}

export const AGENT_BIAS_INSTRUMENTS: Instrument[] = [
  ...FOREX_PAIRS.map((p) => ({ display: p.label, yahoo: p.yahoo, assetType: "forex" as const })),
  ...CRYPTO_PAIRS.map((p) => ({ display: p.label, yahoo: p.yahoo, assetType: "crypto" as const })),
];

export function findInstrument(yahoo: string): Instrument | undefined {
  return AGENT_BIAS_INSTRUMENTS.find((i) => i.yahoo === yahoo);
}
