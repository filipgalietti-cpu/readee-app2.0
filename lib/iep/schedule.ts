/**
 * Map intervention-plan sessions to real calendar dates.
 *
 * Given a start date and a flat list of sessions (already in plan
 * order — Week 1 Day 1, Week 1 Day 2, ..., Week 2 Day 4), assign each
 * session to the next available weekday. Saturdays and Sundays are
 * skipped because school-based interventions don't run on weekends.
 *
 * The kid's classroom calendar may have its own holidays; we don't
 * know about them, so the teacher can always shift the start date or
 * unassign individual rows after push if a particular day misfires.
 */

const ONE_DAY_MS = 86_400_000;

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function nextWeekday(date: Date): Date {
  const d = new Date(date.getTime());
  while (isWeekend(d)) {
    d.setTime(d.getTime() + ONE_DAY_MS);
  }
  return d;
}

/**
 * Compute one Date per session, walking forward from `startDate` and
 * skipping weekends. The first session lands on the start date itself
 * if it's a weekday, else on the following Monday.
 */
export function computeSessionSchedule(
  startDate: Date,
  sessionCount: number,
): Date[] {
  const out: Date[] = [];
  let cursor = nextWeekday(new Date(startDate.getTime()));
  for (let i = 0; i < sessionCount; i++) {
    out.push(new Date(cursor.getTime()));
    cursor.setTime(cursor.getTime() + ONE_DAY_MS);
    cursor = nextWeekday(cursor);
  }
  return out;
}

/** Format a Date as "Thu, Apr 30" (no year) for tight display. */
export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Format a Date as "Apr 30, 2026" — used in plan range headers. */
export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
