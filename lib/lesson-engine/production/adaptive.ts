/** Transparent, bounded selection shared by lesson checks and unit checkpoints. */
// Preserve existing stored band identities; expose clear authoring labels.
export const QUESTION_BANDS = ["easier", "core", "harder", "challenging"] as const;
export type Band = (typeof QUESTION_BANDS)[number];
export const QUESTION_BAND_LABELS: Record<Band, string> = {
  easier: "Easy", core: "Regular", harder: "Hard", challenging: "Challenging",
};
export type AdaptiveItem = { id: string; standard: string; band: Band; difficulty: number };
export type IndependentResult = {
  itemId: string;
  standard: string;
  band: Band;
  outcome: "correct" | "incorrect" | "assisted" | "unavailable" | "skipped" | "practice";
};
export type SkillReadiness = { band: Band; rightRun: number; wrongRun: number };
const bands = QUESTION_BANDS;
export function updateReadiness(
  previous: SkillReadiness,
  result: IndependentResult,
): SkillReadiness {
  if (
    result.outcome === "unavailable" ||
    result.outcome === "skipped" ||
    result.outcome === "practice"
  )
    return previous;
  if (result.outcome === "assisted") return { ...previous, rightRun: 0, wrongRun: 0 };
  // A forced coverage item outside the current band is evidence at THAT difficulty.
  const base = { ...previous, band: result.band };
  if (result.outcome === "correct") {
    const run = (result.band === previous.band ? previous.rightRun : 0) + 1;
    return {
      band: run >= 3 ? bands[Math.min(bands.length - 1, bands.indexOf(result.band) + 1)] : result.band,
      rightRun: run >= 3 ? 0 : run,
      wrongRun: 0,
    };
  }
  const run = (result.band === previous.band ? previous.wrongRun : 0) + 1;
  return {
    ...base,
    band: run >= 2 ? bands[Math.max(0, bands.indexOf(result.band) - 1)] : result.band,
    wrongRun: run >= 2 ? 0 : run,
    rightRun: 0,
  };
}
export function selectCheckpointItem({
  pool,
  standards,
  results,
  asked,
  readiness,
  maxItems,
}: {
  pool: AdaptiveItem[];
  standards: string[];
  results: IndependentResult[];
  asked: string[];
  readiness: Record<string, SkillReadiness>;
  maxItems: number;
}): AdaptiveItem | null {
  if (maxItems < standards.length) throw Error("Item budget cannot cover every assigned standard");
  if (asked.length >= maxItems) return null;
  if (new Set(pool.map((q) => q.id)).size !== pool.length)
    throw Error("Duplicate question identity");
  const remaining = pool.filter((q) => standards.includes(q.standard) && !asked.includes(q.id));
  // Exposure is not evidence. Unavailable/skipped items do not satisfy coverage.
  const coverage = (s: string) =>
    results.filter(
      (r) => r.standard === s && (r.outcome === "correct" || r.outcome === "incorrect"),
    ).length;
  const exposure = (s: string) =>
    pool.filter((q) => q.standard === s && asked.includes(q.id)).length;
  // Offer every skill before revisiting one. A failed microphone must not consume
  // the entire checkpoint while leaving other skills unseen.
  const candidates = standards
    .filter((s) => remaining.some((q) => q.standard === s))
    .sort(
      (a, b) =>
        Number(exposure(a) > 0) - Number(exposure(b) > 0) ||
        coverage(a) - coverage(b) ||
        exposure(a) - exposure(b),
    );
  if (!candidates.length) return null;
  const standard = candidates[0],
    band = readiness[standard]?.band ?? "core";
  return (
    remaining
      .filter((q) => q.standard === standard)
      .sort(
        (a, b) =>
          Math.abs(bands.indexOf(a.band) - bands.indexOf(band)) -
            Math.abs(bands.indexOf(b.band) - bands.indexOf(band)) ||
          a.difficulty - b.difficulty ||
          a.id.localeCompare(b.id),
      )[0] ?? null
  );
}
