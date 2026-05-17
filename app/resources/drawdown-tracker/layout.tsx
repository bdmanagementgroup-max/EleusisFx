import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FTMO Drawdown Tracker — Free Prop Firm Drawdown Calculator | Eleusis FX",
  description: "Track your daily and maximum drawdown against FTMO limits in real time. Free drawdown calculator for FTMO, The5ers, and FundedNext prop firm challenges.",
  openGraph: {
    title: "FTMO Drawdown Tracker | Eleusis FX",
    description: "Real-time drawdown calculator for prop firm challenges. Track daily loss and max drawdown against FTMO rules.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
