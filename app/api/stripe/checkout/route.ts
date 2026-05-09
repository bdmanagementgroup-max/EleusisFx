import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Subscriptions are not yet available. Check back soon." },
    { status: 503 }
  );
}
