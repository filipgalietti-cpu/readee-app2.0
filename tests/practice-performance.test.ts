import { expect, it } from "vitest";
import { practicePerformance } from "@/lib/lesson-engine/production/practice-performance";
import { packages } from "@/lib/approved-unit/packages";
import type { PracticeAttempt, PracticeQuestion } from "@/lib/lesson-engine/production/practice";
const pool = packages["key-details"].pool;
const graded = pool.filter((q) => q.scene.evidence === "assessed").slice(0, 3);
function attempt(
  questions: PracticeQuestion[],
  outcomes: PracticeAttempt["results"][number]["outcome"][],
): PracticeAttempt {
  return {
    version: 1,
    id: "synthetic",
    flowId: "test",
    asked: questions.map((q) => q.id),
    finished: true,
    evidence: {},
    results: questions.map((q, i) => ({
      itemId: q.id,
      standard: q.standard,
      band: q.band,
      outcome: outcomes[i],
    })),
  };
}
it("grades each question once and preserves the first-answer result after retries", () => {
  const a = attempt(graded, ["correct", "incorrect", "correct"]);
  a.evidence[`${graded[1].id}/answer`] = {
    attempts: 2,
    helped: false,
    completed: true,
    outcome: "after-error",
    skill: graded[1].standard,
  };
  const p = practicePerformance(pool, a);
  expect(p).toMatchObject({ correct: 2, scored: 3, percent: 67, pending: 0 });
  expect(p.rows[1].outcome).toBe("incorrect");
});
it.each(["unavailable", "skipped", "assisted"] as const)(
  "does not fail or hide a %s question in the score",
  (outcome) => {
    const p = practicePerformance(pool, attempt(graded, ["correct", outcome, "correct"]));
    expect(p).toMatchObject({ percent: null, correct: 2, pending: 1, scored: 3 });
  },
);
it("personal answers and supported reading are not scored", () => {
  const supported = pool.find((q) => q.scene.evidence === "practice")!;
  expect(supported).toBeDefined();
  const p = practicePerformance(pool, attempt([graded[0], supported], ["correct", "practice"]));
  expect(p).toMatchObject({ total: 2, scored: 1, supported: 1, percent: 100 });
});
it("incomplete and empty attempts never report 100%", () => {
  expect(
    practicePerformance(pool, {
      ...attempt(graded, ["correct", "correct", "correct"]),
      finished: false,
    }).percent,
  ).toBeNull();
  expect(practicePerformance(pool, attempt([], [])).percent).toBeNull();
});
