import { expect, it } from "vitest";
import { examRetry } from "@/lib/approved-unit/exam-retry";
import type { SessionState } from "@/lib/approved-unit/state";
const state = { practice: { id: "attempt-one", finished: true } } as SessionState;
it("archives the completed result and clears the new sitting without carrying its score", () => {
  const result = {
    correct: 6,
    results: [{ outcome: "incorrect" }],
    readiness: { status: "practice" },
  };
  const next = examRetry({ state, result }, "attempt-one")!;
  expect(next.state).toEqual({});
  expect(next.result).toMatchObject({
    correct: 0,
    results: [],
    readiness: { status: "more-evidence", percent: null },
    history: [{ attemptId: "attempt-one", ...result }],
  });
  expect(result.correct).toBe(6);
  expect(examRetry(next, "attempt-one")).toBeNull();
});
it("rejects in-progress, passed, and stale attempts", () => {
  expect(() =>
    examRetry({ state, result: { readiness: { status: "ready" } } }, "attempt-one"),
  ).toThrow();
  expect(() => examRetry({ state, result: null }, "another-attempt")).toThrow();
  expect(() =>
    examRetry(
      { state: { practice: { ...state.practice!, finished: false } }, result: null },
      "attempt-one",
    ),
  ).toThrow();
});
