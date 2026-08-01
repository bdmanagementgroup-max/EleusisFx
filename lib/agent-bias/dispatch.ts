import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { AGENT_BIAS_INSTRUMENTS } from "@/lib/agent-bias/instruments";
import { resolvePendingOutcomes } from "@/lib/agent-bias/outcome";

export interface AgentBiasDispatchResult {
  resolvedOutcomes: number;
  dispatched: number;
  succeeded: number;
  failed: number;
}

export class DispatchAlreadyRunningError extends Error {
  constructor() {
    super("A dispatch is already running");
    this.name = "DispatchAlreadyRunningError";
  }
}

const LOCK_KEY = "agent_bias_dispatch_lock";
// Safely above maxDuration=300s on both callers, so a run that hit the
// function timeout doesn't leave the lock stuck forever.
const LOCK_TIMEOUT_MS = 6 * 60 * 1000;

// Best-effort guard against two overlapping dispatches (a double-clicked
// "fire now", or a manual run overlapping the nightly cron) — each run is
// 16 real LLM calls, so an overlap doubles spend for no benefit. This is a
// check-then-set against app_settings, not a real atomic lock (there's a
// small race window between the read and the write); adequate for the
// expected caller volume (one human admin, one scheduled cron) but not a
// substitute for a proper advisory lock if this ever gets more callers.
async function acquireDispatchLock(supabase: Awaited<ReturnType<typeof getSupabaseAdminClient>>): Promise<boolean> {
  const { data } = await supabase
    .from("app_settings")
    .select("setting_value")
    .eq("setting_key", LOCK_KEY)
    .maybeSingle();

  const lockedAt = typeof data?.setting_value === "string" ? Date.parse(data.setting_value) : NaN;
  if (!Number.isNaN(lockedAt) && Date.now() - lockedAt < LOCK_TIMEOUT_MS) {
    return false;
  }

  await supabase
    .from("app_settings")
    .upsert({ setting_key: LOCK_KEY, setting_value: new Date().toISOString() }, { onConflict: "setting_key" });
  return true;
}

async function releaseDispatchLock(supabase: Awaited<ReturnType<typeof getSupabaseAdminClient>>): Promise<void> {
  await supabase
    .from("app_settings")
    .upsert({ setting_key: LOCK_KEY, setting_value: null }, { onConflict: "setting_key" });
}

// Shared by the nightly cron route and the admin "fire now" route — both
// need identical fan-out behavior, just different auth and triggers.
export async function runAgentBiasDispatch(): Promise<AgentBiasDispatchResult> {
  const supabase = await getSupabaseAdminClient();

  if (!(await acquireDispatchLock(supabase))) {
    throw new DispatchAlreadyRunningError();
  }

  try {
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
  } finally {
    await releaseDispatchLock(supabase);
  }
}
