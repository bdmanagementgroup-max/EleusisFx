import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forex Position Size Calculator — Free Lot Size Tool | Eleusis FX",
  description: "Calculate your exact forex lot size based on account balance, risk percentage, and stop loss pips. Free position size calculator for FTMO and prop firm traders.",
  openGraph: {
    title: "Forex Position Size Calculator | Eleusis FX",
    description: "Free lot size calculator for forex traders. Enter your balance, risk %, and stop loss to get your exact position size.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
