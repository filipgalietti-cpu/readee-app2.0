/**
 * Best-of-N generation orchestrator (Phase 3 of the no-human-review
 * gameplan, per CONTENT_SPEC §5.1).
 *
 * Generators that produce a single candidate per slot will publish
 * the median quality of what the model can produce. Best-of-N
 * generates 3 candidates per slot, audits each via the deterministic
 * spec checks (and optionally the multi-judge committee), picks the
 * lowest-demerit one, and persists ONLY the winner.
 *
 * Cost: 3× per slot in compose-step AI tokens. Negligible at our
 * volume (~$0.30-0.90/day across all generators). The deterministic
 * scoring step is free.
 *
 * How to adopt this in a generator:
 *
 * 1. Split the generator into `compose()` (returns candidate data,
 *    no DB writes) and `persist()` (writes the candidate to its
 *    table + Supabase Storage).
 *
 * 2. Wrap the call site in `bestOfN({ compose, score, n: 3 })`.
 *    The default `scoreByAuditDemerits` runs the same deterministic
 *    spec checks the nightly audit uses.
 *
 * 3. Call `persist(result.winner)` only if the winner's score is
 *    below your acceptance threshold (defaults to fewer than 3 fails
 *    + fewer than 10 warns; tune per generator).
 */

import { runQuestionSpecChecks, runLessonSpecChecks, type CheckResult } from "./spec-checks";

export type BestOfNResult<TCandidate> = {
  /** Lowest-demerit candidate. */
  winner: TCandidate;
  /** Demerit score for the winner (0 = perfect). */
  winnerScore: number;
  /** All candidates with their scores, sorted ascending (winner first). */
  ranked: Array<{ candidate: TCandidate; score: number; reasons: string[] }>;
  /** Did the winner pass the acceptance threshold? */
  accepted: boolean;
};

export type ScoreFn<TCandidate> = (candidate: TCandidate) => Promise<{
  score: number;
  reasons: string[];
}>;

/**
 * Score a candidate by summing audit demerits.
 *   - Each `fail` finding: +100 demerits (effectively disqualifying).
 *   - Each `warn` finding: +1 demerit.
 *   - 0 = perfect; lower is better.
 *
 * Caller chooses which spec-checks runner to use based on the
 * candidate shape — `scoreQuestion` for question candidates,
 * `scoreLesson` for lesson candidates.
 */
function demeritsOf(results: CheckResult[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  for (const r of results) {
    if (r.ok) continue;
    score += r.severity === "fail" ? 100 : 1;
    reasons.push(`[${r.severity}] ${r.findingType}: ${r.message}`);
  }
  return { score, reasons };
}

/**
 * Score a question candidate using deterministic spec checks.
 * Does NOT call the LLM judges — those are too slow for best-of-N
 * scoring (each judge call adds 2-5s; running soft judges on 3
 * candidates would 6× the slot duration). Soft judges still run
 * on the published winner during the next nightly audit pass.
 */
export async function scoreQuestion(candidate: {
  type: string;
  grade?: string | null;
  prompt?: string;
  choices?: unknown;
  correct?: string;
  audio_url?: string | null;
  image_url?: string | null;
}): Promise<{ score: number; reasons: string[] }> {
  const results = runQuestionSpecChecks(candidate);
  return demeritsOf(results);
}

/**
 * Score a lesson candidate using deterministic spec checks.
 */
export async function scoreLesson(candidate: {
  grade?: string | null;
  slides?: any[];
}): Promise<{ score: number; reasons: string[] }> {
  const results = runLessonSpecChecks(candidate);
  return demeritsOf(results);
}

/**
 * Run `compose` N times in parallel, score each, return the winner.
 *
 * Acceptance threshold defaults: winner is accepted if its demerit
 * score < 100 (i.e., zero `fail` findings — warns are tolerated).
 * Generators that need stricter publish gates can pass a custom
 * threshold or call this and inspect `result.accepted` themselves.
 */
export async function bestOfN<TCandidate>(args: {
  compose: () => Promise<TCandidate>;
  score: ScoreFn<TCandidate>;
  n?: number;
  /** Max acceptable demerit score. Default 99 (no fails). */
  acceptUnderScore?: number;
}): Promise<BestOfNResult<TCandidate>> {
  const n = Math.max(1, args.n ?? 3);
  const acceptUnder = args.acceptUnderScore ?? 99;

  // Parallel compose
  const candidates = await Promise.all(
    Array.from({ length: n }, () => args.compose()),
  );

  // Parallel score
  const scored = await Promise.all(
    candidates.map(async (c) => ({ candidate: c, ...(await args.score(c)) })),
  );

  // Rank: lower score wins; ties broken by index (stable).
  scored.sort((a, b) => a.score - b.score);

  const winner = scored[0];
  return {
    winner: winner.candidate,
    winnerScore: winner.score,
    ranked: scored,
    accepted: winner.score <= acceptUnder,
  };
}
