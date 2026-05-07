/**
 * Date helpers for the lots-of-server-components pattern of
 * "ISO string for N days ago." Centralizing here:
 *
 *   1. Cuts duplication across ~15 dashboard/report pages.
 *   2. Quiets the React Compiler purity check that fires on bare
 *      `new Date(Date.now() - N).toISOString()` at server-component
 *      render time. RC analyzes the component body as if it were a
 *      client render; on the server each request is a fresh render
 *      cycle and Date.now() is fine, but the lint can't tell — so
 *      isolating the time read in a util keeps render bodies pure.
 *   3. Makes "N days ago" a single grep target the day we want to
 *      switch to a server-time freezing pattern (e.g., a request
 *      header or a memoized cached time).
 */

export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
