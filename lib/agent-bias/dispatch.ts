import { AGENT_BIAS_INSTRUMENTS } from "@/lib/agent-bias/instruments";
import { resolvePendingOutcomes } from "@/lib/agent-bias/outcome";

export interface AgentBiasDispatchResult {
  resolvedOutcomes: number;
  dispatched: number;
  succeeded: number;
  failed: number;
}

// Shared by the nightly cron route and the admin "fire now" route — both
// need identical fan-out behavior, just different auth and triggers.
export async function runAgentBiasDispatch(): Promise<AgentBiasDispatchResult> {
  const outcomeResult = await resolvePendingOutcomes();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.uk";
  const workerUrl = `${siteUrl}/api/cron/agent-bias/run`;

  const results = await Promise.allSettled(
    AGENT_BIAS_INSTRUMENTS.map((instrument) =>
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

  let succeeded = 0;
  let failed = 0;
  for (const r of results) {
    if (r.status === "fulfilled") succeeded++;
    else {
      failed++;
      console.error("[AgentBias] worker failed:", r.reason);
    }
  }

  return {
    resolvedOutcomes: outcomeResult.resolved,
    dispatched: AGENT_BIAS_INSTRUMENTS.length,
    succeeded,
    failed,
  };
}
