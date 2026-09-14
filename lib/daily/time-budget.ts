/**
 * A wall-clock budget for a job that runs in phases.
 *
 * `exhausted()` turns true once only the reserve is left, so the caller stops
 * starting new phases and returns cleanly instead of being cut off by the
 * platform mid-phase. The reserve should cover one phase's worst case.
 */
export function timeBudget(totalMs: number, reserveMs: number, now: () => number = Date.now) {
  const startedAt = now();
  return {
    elapsedMs: () => now() - startedAt,
    exhausted: () => now() - startedAt >= totalMs - reserveMs,
  };
}
