import type { SessionState } from "./state";

export type StoredExamResult = Record<string, unknown> & {
  readiness?: { status?: string };
  history?: unknown[];
  previousAttemptId?: string;
};
/** Called only after ownership/access checks, then saved under the existing
 * revision lock. The DB's completed latch keeps rewards once-per-release. */
export function examRetry(
  prior: { state: SessionState; result: StoredExamResult | null },
  attemptId: string,
) {
  if (!prior.state.practice && prior.result?.previousAttemptId === attemptId) return null;
  if (
    !prior.state.practice?.finished ||
    prior.state.practice.id !== attemptId ||
    prior.result?.readiness?.status === "ready"
  )
    throw Error("Exam cannot restart");
  const { history = [], ...previous } = prior.result ?? {};
  delete previous.previousAttemptId;
  return {
    state: {},
    result: {
      attempted: 0,
      correct: 0,
      results: [],
      readiness: { status: "more-evidence", percent: null },
      previousAttemptId: attemptId,
      history: [...history, { attemptId, ...previous }],
    },
  };
}
