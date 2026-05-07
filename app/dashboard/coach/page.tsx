import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// AI Coach is disabled — remove notFound() call to re-enable
export default function CoachPage() {
  notFound();
}
