import { NextRequest, NextResponse } from "next/server";
import { AGENT_BIAS_INSTRUMENTS } from "@/lib/agent-bias/instruments";
import { resolvePendingOutcomes } from "@/lib/agent-bias/outcome";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorizedCron(req: NextRequest): boolean {
  if (!process.env.CRON_SECRET) return false;
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const outcomeResult = await resolvePendingOutcomes();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.com";
  const workerUrl = `${siteUrl}/api/cron/agent-bias/run`;
  const batches = chunk(AGENT_BIAS_INSTRUMENTS, 4);

  let succeeded = 0;
  let failed = 0;

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((instrument) =>
        fetch(workerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({ instrument: instrument.yahoo }),
        }).then((res) => {
          if (!res.ok) throw new Error(`Worker returned ${res.status} for ${instrument.yahoo}`);
          return res.json();
        })
      )
    );
    for (const r of results) {
      if (r.status === "fulfilled") succeeded++;
      else {
        failed++;
        console.error("[AgentBias] worker failed:", r.reason);
      }
    }
  }

  return NextResponse.json({
    resolvedOutcomes: outcomeResult.resolved,
    dispatched: AGENT_BIAS_INSTRUMENTS.length,
    succeeded,
    failed,
  });
}
