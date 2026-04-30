/**
 * Consistent error + run tracking for every factory cron. Wraps the
 * existing trackError so all factory failures share a route prefix
 * and can be filtered in Sentry as one stream.
 */

import { trackError } from "@/lib/observability/track";
import { supabaseAdmin } from "@/lib/supabase/admin";

export function trackFactoryError(
  err: Error | unknown,
  context: {
    assetKind: string;
    runId?: string | null;
    extra?: Record<string, unknown>;
  },
): void {
  const e = err instanceof Error ? err : new Error(String(err));
  trackError(e, {
    route: `factory.${context.assetKind}`,
    extra: {
      runId: context.runId ?? null,
      ...(context.extra ?? {}),
    },
  });
}

export type RunStartInput = {
  assetKind: string;
  requestedCount: number;
  promptVersion: string;
  batchJobId?: string | null;
};

/**
 * Idempotent factory_runs row creation. If today already has a row
 * for this asset_kind, returns null and the cron should bail. Otherwise
 * inserts a "running" row and returns its id.
 */
export async function startFactoryRun(
  input: RunStartInput,
): Promise<{ ok: true; runId: string } | { ok: false; reason: "already_ran" | "db_error"; error?: string }> {
  const supabase = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  // Pre-check — do we already have a completed/aborted run for today?
  const { data: existing } = await supabase
    .from("factory_runs")
    .select("id, status")
    .eq("run_date", today)
    .eq("asset_kind", input.assetKind)
    .maybeSingle();
  if (existing) {
    return { ok: false, reason: "already_ran" };
  }

  const { data, error } = await supabase
    .from("factory_runs")
    .insert({
      run_date: today,
      asset_kind: input.assetKind,
      requested_count: input.requestedCount,
      prompt_version: input.promptVersion,
      batch_job_id: input.batchJobId ?? null,
      status: "running",
    })
    .select("id")
    .single();
  if (error || !data) {
    // Race: unique index conflict → another invocation started first.
    if (error?.code === "23505") {
      return { ok: false, reason: "already_ran" };
    }
    return { ok: false, reason: "db_error", error: error?.message };
  }
  return { ok: true, runId: (data as { id: string }).id };
}

export type RunFinishInput = {
  runId: string;
  status: "completed" | "failed" | "aborted";
  generatedCount?: number;
  passCount?: number;
  warnCount?: number;
  failCount?: number;
  creditsUsed?: number;
  error?: string | null;
};

export async function finishFactoryRun(input: RunFinishInput): Promise<void> {
  const supabase = supabaseAdmin();
  await supabase
    .from("factory_runs")
    .update({
      status: input.status,
      generated_count: input.generatedCount ?? 0,
      pass_count: input.passCount ?? 0,
      warn_count: input.warnCount ?? 0,
      fail_count: input.failCount ?? 0,
      credits_used: input.creditsUsed ?? 0,
      error: input.error ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.runId);
}

/** Sum of credits_used across all factory_runs today. */
export async function todayCreditSpend(): Promise<number> {
  const supabase = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("factory_runs")
    .select("credits_used")
    .eq("run_date", today);
  return ((data ?? []) as { credits_used: number }[]).reduce(
    (acc, r) => acc + (r.credits_used ?? 0),
    0,
  );
}
