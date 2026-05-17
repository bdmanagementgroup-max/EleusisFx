import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forex Risk/Reward Calculator — Free R:R Tool | Eleusis FX",
  description: "Calculate your risk-to-reward ratio instantly. Enter your entry, stop loss, and take profit to see your R:R ratio and profit/loss in pips and dollars.",
  openGraph: {
    title: "Forex Risk/Reward Calculator | Eleusis FX",
    description: "Free R:R calculator for forex and prop firm traders. Visualise your trade setup before you enter.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
