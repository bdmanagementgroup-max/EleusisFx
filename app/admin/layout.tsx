import AdminShell from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Eleusis FX" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
