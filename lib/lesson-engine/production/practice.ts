import type { SceneDef } from "../types";
import type { Evidence } from "../delivery/types";
import { sceneItemIds } from "../delivery/evidence";
import type { AdaptiveItem, IndependentResult, SkillReadiness } from "./adaptive";
import { selectCheckpointItem, updateReadiness } from "./adaptive";
export type PracticeQuestion = AdaptiveItem & {
  scene: SceneDef;
  explanation?: string;
  phase?: "reading-finish";
};
export type PracticeAttempt = {
  version: 1;
  startingStreak?: number;
  sourceAttemptId?: string;
  id: string;
  flowId: string;
  asked: string[];
  results: IndependentResult[];
  evidence: Evidence;
  finished: boolean;
};
/** The first independent response is the signal. Retry success is still valuable
 * practice, but cannot erase an initial error or assistance. */
export function independentResult(
  question: PracticeQuestion,
  evidence: Evidence,
): IndependentResult {
  const entries = sceneItemIds(question.scene).map((id) => evidence[`${question.id}/${id}`]);
  const unavailable = evidence[`${question.id}/availability`]?.outcome === "unavailable";
  const tracked = entries.filter((e) => e?.attempts > 0).every((e) => !!e.firstResponse);
  const helped =
    entries.some((e) => e?.firstResponse === "assisted") ||
    (!tracked && (evidence[`${question.id}/help`]?.helped || entries.some((e) => e?.helped)));
  const initialError = entries.some((e) => e?.firstResponse === "incorrect");
  const incorrect = entries.some((e) => e?.attempts > 1 || (e?.attempts > 0 && !e.completed));
  const complete = entries.length > 0 && entries.every((e) => e?.completed && e.attempts > 0);
  return {
    itemId: question.id,
    standard: question.standard,
    band: question.band,
    outcome: unavailable
      ? "unavailable"
      : question.scene.evidence === "practice"
        ? complete
          ? "practice"
          : "skipped"
        : initialError
          ? "incorrect"
          : helped
            ? "assisted"
            : incorrect
              ? "incorrect"
              : complete
                ? "correct"
                : "skipped",
  };
}
export function readinessFrom(results: IndependentResult[]) {
  const skills: Record<string, SkillReadiness> = {};
  for (const result of results)
    skills[result.standard] = updateReadiness(
      skills[result.standard] ?? { band: "core", rightRun: 0, wrongRun: 0 },
      result,
    );
  return skills;
}
export function nextPracticeQuestion(
  pool: PracticeQuestion[],
  standards: string[],
  attempt: PracticeAttempt,
  maxItems: number,
) {
  // Reserve the authored closing turns even when the assessment bank is larger
  // than this sitting. Previously unused checks consumed the entire budget.
  const closing = pool.filter(q => q.phase === "reading-finish");
  const checkBudget = maxItems - closing.length;
  if (checkBudget < standards.length) throw Error("Practice budget must cover assigned standards and closing turns");
  const checkPool = pool.filter(q => q.phase !== "reading-finish");
  const askedChecks = attempt.asked.filter(id => checkPool.some(q => q.id === id));
  const remainingChecks = checkPool.filter(q => !askedChecks.includes(q.id));
  if ((!remainingChecks.length || askedChecks.length >= checkBudget) && attempt.asked.length < maxItems) {
    const reading = pool.find((q) => q.phase === "reading-finish" && !attempt.asked.includes(q.id));
    if (reading) return reading;
  }
  return selectCheckpointItem({
    pool: checkPool,
    standards,
    asked: askedChecks,
    results: attempt.results,
    readiness: readinessFrom(attempt.results),
    maxItems: checkBudget,
  });
}
export function validPracticeAttempt(
  value: unknown,
  flowId: string,
  pool: PracticeQuestion[],
  maxItems: number,
): value is PracticeAttempt {
  if (!value || typeof value !== "object") return false;
  const v = value as PracticeAttempt;
  if (
    v.version !== 1 ||
    v.flowId !== flowId ||
    typeof v.id !== "string" ||
    !Array.isArray(v.asked) ||
    !Array.isArray(v.results) ||
    typeof v.finished !== "boolean" ||
    !v.evidence ||
    typeof v.evidence !== "object"
  )
    return false;
  if (
    v.startingStreak !== undefined &&
    (!Number.isSafeInteger(v.startingStreak) || v.startingStreak < 0 || v.startingStreak > 10000)
  )
    return false;
  if (
    v.asked.length > maxItems ||
    new Set(v.asked).size !== v.asked.length ||
    v.asked.some((id) => !pool.some((q) => q.id === id))
  )
    return false;
  if (v.results.length !== v.asked.length - (v.finished ? 0 : 1)) return false;
  return v.results.every((r, i) => {
    const q = pool.find((q) => q.id === v.asked[i]);
    return (
      q &&
      r.itemId === q.id &&
      r.standard === q.standard &&
      r.band === q.band &&
      (r.outcome !== "practice" || q.scene.evidence === "practice") &&
      ["correct", "incorrect", "assisted", "unavailable", "skipped", "practice"].includes(r.outcome)
    );
  });
}

/** Celebration is derived once from independent outcomes, not eventual retry success. */
export function isPerfectPractice(attempt: PracticeAttempt, maxItems: number) {
  return (
    attempt.finished &&
    maxItems > 0 &&
    attempt.results.length === maxItems &&
    new Set(attempt.results.map((r) => r.itemId)).size === maxItems &&
    attempt.results.some((r) => r.outcome === "correct") &&
    attempt.results.every((r) => r.outcome === "correct" || r.outcome === "practice") &&
    // Supported work remains practice even after a retry. Its coarse outcome
    // must not hide recorded help/errors when awarding first-try praise.
    attempt.results.filter((r) => r.outcome === "practice").every((result) =>
      Object.entries(attempt.evidence)
        .filter(([key]) => key.startsWith(`${result.itemId}/`))
        .every(([, entry]) => entry.attempts <= 1 && !entry.helped &&
          entry.firstResponse !== "incorrect" && entry.firstResponse !== "assisted"),
    )
  );
}
