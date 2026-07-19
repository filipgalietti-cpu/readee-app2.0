/**
 * Guarded Supabase writes — so a persistence write can never fail silently.
 *
 * PostgREST/supabase-js RESOLVES (it does not reject) when a write is denied by
 * RLS, rolled back by a trigger, or blocked by a constraint — it returns
 * `{ error }`. Code that does `await supabase.from(t).insert(x)` and never reads
 * that error will drop the write with zero signal. That is exactly how practice
 * completions silently stopped saving app-wide for a week (a trigger writing an
 * RLS-locked table rolled back every insert).
 *
 * Route every user-progress / currency write through `savedOk()` so a failure
 * is always logged and surfaced. Returns true on success, false on failure
 * (so callers can decide whether to roll back optimistic UI, retry, or toast).
 */

type WriteError = { message?: string; code?: string } | null;

export async function savedOk(
  label: string,
  op: PromiseLike<{ error: WriteError }>,
): Promise<boolean> {
  const { error } = await op;
  if (!error) return true;

  // 23505 = unique_violation — almost always a benign race (another tab/page
  // wrote the same row first). The row exists, so treat it as success.
  if (error.code === "23505") return true;

  console.error(`[save-failed] ${label}:`, error);
  // Broadcast so a global listener (e.g. a toast) can tell the kid/parent the
  // save didn't stick, instead of pretending it did. No-op if nothing listens.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("readee:save-failed", { detail: { label, code: error.code } }),
    );
  }
  return false;
}
