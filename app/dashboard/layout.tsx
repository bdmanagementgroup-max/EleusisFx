import DashboardShell from "@/components/dashboard/DashboardShell";
import { isAiCoachEnabled } from "@/lib/features/isCoachEnabled";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Eleusis FX",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const coachEnabled = await isAiCoachEnabled();
  
  return <DashboardShell coachEnabled={coachEnabled}>{children}</DashboardShell>;
}
