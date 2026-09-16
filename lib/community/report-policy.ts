/** What a reader can say is wrong with a story. Kid-simple, no free text. */
export const REPORT_REASONS = ["Not for kids", "Not true", "Something else"] as const;

export function normalizeReportReason(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const reason = raw.trim().slice(0, 500);
  return reason ? reason : null;
}

/**
 * Every flag lands in the admin queue. It reaches the inbox only when a person
 * can act on it: the story came down, the AI no longer passes it or could not
 * run, or the reader said what was wrong. A bare anonymous tap on a story the
 * AI still passes (a crawler clicking buttons, a stray tap) stays in the queue.
 */
export function shouldEmailReport(input: {
  removed: boolean;
  compliant: boolean;
  errored: boolean;
  reason: string | null;
}): boolean {
  return input.removed || !input.compliant || input.errored || input.reason !== null;
}
