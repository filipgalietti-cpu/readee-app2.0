/** Compact view of server-graded outcomes. No transcripts or submissions cross
 * into the map or email. Missing evidence is never counted as incorrect. */
export function savedLessonStats(results: unknown, carrots: number = 0) {
  if (!Array.isArray(results) || results.length === 0) return null;
  const allowed = ["correct", "incorrect", "assisted", "practice", "skipped", "unavailable"];
  const outcomes = results.map((r) => (r && typeof r === "object" ? r.outcome : undefined));
  if (outcomes.some((x) => !allowed.includes(x))) return null;
  const count = (outcome: string) => outcomes.filter((x) => x === outcome).length;
  const correct = count("correct"),
    checked = correct + count("incorrect");
  return {
    total: outcomes.length,
    correct,
    checked,
    helped: count("assisted"),
    pending: count("skipped") + count("unavailable"),
    supported: count("practice"),
    percent:
      checked > 0 && count("assisted") + count("skipped") + count("unavailable") === 0
        ? Math.round((correct / checked) * 100)
        : null,
    carrots: Number.isFinite(carrots) ? Math.max(0, Math.floor(carrots)) : 0,
  };
}
export type SavedLessonStats = NonNullable<ReturnType<typeof savedLessonStats>>;
export function lessonStatsLine(stats: SavedLessonStats) {
  return `${stats.checked ? `${stats.correct} of ${stats.checked} independently checked questions correct` : "Independent score pending"}${stats.percent === null ? "" : ` (${stats.percent}%)`}${stats.helped ? ` · ${stats.helped} with help` : ""}${stats.pending ? ` · ${stats.pending} still need a check` : ""}`;
}
