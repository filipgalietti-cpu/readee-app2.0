import type { PracticeAttempt, PracticeQuestion } from "./practice";
import type { IndependentResult } from "./adaptive";

/** One question = one result, even for multi-item sorts and matches. The server
 * calls this with canonical results; the preview uses its local evidence. */
export function practicePerformance(
  pool: readonly PracticeQuestion[],
  attempt: Pick<PracticeAttempt, "asked" | "results" | "finished">,
) {
  const rows = [...new Set(attempt.asked)].map((id) => {
    const question = pool.find((q) => q.id === id);
    const result = attempt.results.find((r) => r.itemId === id);
    const assessed = question?.scene.evidence === "assessed";
    const outcome: IndependentResult["outcome"] = result?.outcome ?? "skipped";
    return {
      id,
      prompt: question?.scene.prompt ?? "Question unavailable",
      standard: question?.standard,
      band: question?.band,
      assessed,
      outcome,
      explanation: question?.explanation ?? question?.scene.feedback?.correct,
    };
  });
  const scored = rows.filter((r) => r.assessed);
  const independent = scored.filter((r) => r.outcome === "correct" || r.outcome === "incorrect");
  const correct = independent.filter((r) => r.outcome === "correct").length;
  const pending = scored.filter((r) => !["correct", "incorrect"].includes(r.outcome)).length;
  return {
    rows,
    total: rows.length,
    scored: scored.length,
    independent: independent.length,
    correct,
    pending,
    supported: rows.length - scored.length,
    // Never turn an unheard answer into a zero, or one answer out of twelve into 100%.
    percent:
      attempt.finished && scored.length > 0 && pending === 0
        ? Math.round((correct / scored.length) * 100)
        : null,
  };
}

export type PracticePerformance = ReturnType<typeof practicePerformance>;
