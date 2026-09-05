/**
 * Guarded Supabase writes — so a child's progress can never be lost silently.
 *
 * PostgREST/supabase-js RESOLVES (it does not reject) when a write is denied by
 * RLS, rolled back by a trigger, or blocked by a constraint — it returns
 * `{ error }`. Code that does `await supabase.from(t).insert(x)` and never reads
 * that error will drop the write with zero signal. That is exactly how practice
 * completions silently stopped saving app-wide for a week (a trigger writing an
 * RLS-locked table rolled back every insert).
 *
 * Two jobs, in this order:
 *
 *   1. RETRY the failures that are worth retrying. A child on a phone loses
 *      connectivity mid-session constantly; that write is recoverable and
 *      should not cost them the session. Pass a FACTORY (`() => supabase...`)
 *      to opt in - a builder that has already been awaited cannot be re-issued.
 *   2. SURFACE what is left. On final failure we log and broadcast
 *      `readee:save-failed`; <SaveFailedNotice /> in the protected layout is
 *      the listener that actually tells the family. Without that listener this
 *      broadcast went nowhere for months, so every guarded write was still
 *      silent in practice.
 *
 * Retry is deliberately NOT the default. `practice_results`, `lessons_progress`
 * and `practice_answers` have no unique constraint, so re-issuing an insert
 * whose response was merely lost would double-count the child's work. Only
 * retry where a duplicate is impossible (a `children` UPDATE sets absolute
 * values; `daily_reads` and `child_skill_memory` have unique keys, so a
 * duplicate surfaces as 23505 and is treated as success below) or where
 * double-counting is clearly less harmful than losing the write.
 */

type WriteError = { message?: string; code?: string } | null;
type WriteResult = { error: WriteError };
type Op = PromiseLike<WriteResult> | (() => PromiseLike<WriteResult>);

export type SavedOkOptions = {
  /** Re-issue on a transient failure. Requires `op` to be a factory. Default 0. */
  retries?: number;
  /** Base backoff in ms; doubles each attempt. Default 400. */
  backoffMs?: number;
};

/**
 * Worth retrying: the write plausibly never reached Postgres. Network drop,
 * gateway error, timeout, connection exception (Postgres class 08).
 *
 * NOT worth retrying: RLS denial (42501), constraint/trigger rejections, an
 * unknown column (PGRST204). Those fail identically forever, and retrying only
 * delays telling the family.
 */
function isTransient(error: NonNullable<WriteError>): boolean {
  const code = error.code ?? "";
  if (code.startsWith("08")) return true;
  if (code === "57014" || code === "53300" || code === "40001" || code === "40P01") return true;
  if (/^5\d\d$/.test(code)) return true;
  const msg = (error.message ?? "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("econnreset") ||
    msg.includes("fetch failed")
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function savedOk(
  label: string,
  op: Op,
  opts: SavedOkOptions = {},
): Promise<boolean> {
  const isFactory = typeof op === "function";
  const retries = isFactory ? Math.max(0, opts.retries ?? 0) : 0;
  const backoffMs = opts.backoffMs ?? 400;

  let last: NonNullable<WriteError> | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let error: WriteError = null;
    try {
      ({ error } = await (isFactory ? (op as () => PromiseLike<WriteResult>)() : op));
    } catch (thrown) {
      // supabase-js normally resolves with { error }, but a hard transport
      // failure can still throw. Treat it as a retryable write error.
      error = { message: thrown instanceof Error ? thrown.message : String(thrown) };
    }

    if (!error) return true;

    // 23505 = unique_violation — almost always a benign race (another tab/page
    // wrote the same row first, or a retry landing twice on a keyed table).
    // The row exists, so treat it as success.
    if (error.code === "23505") return true;

    last = error;
    if (attempt < retries && isTransient(error)) {
      await sleep(backoffMs * 2 ** attempt);
      continue;
    }
    break;
  }

  console.error(`[save-failed] ${label}:`, last);
  // Broadcast so <SaveFailedNotice /> can tell the family the save didn't stick,
  // instead of the app pretending it did.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("readee:save-failed", { detail: { label, code: last?.code } }),
    );
  }
  return false;
}
