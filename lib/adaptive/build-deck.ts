/**
 * Compose a "Sharpen Up" multi-standard practice deck.
 *
 * Pulls questions from the kid's weakest standards and interleaves
 * them into one cohesive session. Each question keeps its original
 * standard via its `id` prefix (e.g. "RL.K.1-Q3" → "RL.K.1") so the
 * downstream save effect can split practice_results back into per-
 * standard rows and keep accuracy analytics intact.
 *
 * Returns null if the kid has no weak spots yet — caller should fall
 * back to the regular practice-hub flow.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getWeakSpots, type WeakSpot } from "./weak-spots";

/**
 * Recover the source standard from a question id. Question ids are
 * `<STANDARD>-Q<n>` (e.g. "RL.K.1-Q3"). Used by the save effect when
 * a sharpen session lands so practice_results splits cleanly by
 * standard instead of polluting with a synthetic "sharpen-multi" id.
 */
export function parseStandardFromQuestionId(questionId: string): string | null {
  const m = questionId.match(/^(.+)-Q\d+$/);
  return m ? m[1] : null;
}

type AnyStandard = { standard_id: string; questions: { id: string }[] };

export type SharpenDeck<Q extends { id: string }> = {
  /** Interleaved question list — round-robin across source standards
   *  so the kid doesn't see 3 RL.K.1 questions in a row before any
   *  RF.K.2 ones. */
  questions: Q[];
  /** The weak spots driving the deck — surfaced in the header so the
   *  kid sees WHY they're seeing these questions ("3 from your tricky
   *  spots"). */
  weakSpots: WeakSpot[];
};

export type BuildDeckOptions = {
  /** Top N weak standards to pull from. Default 3 — more = unfocused. */
  topN?: number;
  /** Questions per standard to include. Default 3. */
  perStandard?: number;
  /** Max total questions (cap). Default 9. */
  maxTotal?: number;
};

/**
 * Pull the kid's top weak standards, sample N questions from each of
 * their question banks, interleave round-robin, return the deck.
 *
 * Note: this is plan-agnostic at the data layer. The premium gate is
 * enforced in the UI (only Readee+ accounts can hit the sharpen route).
 */
export async function buildSharpenDeck<S extends AnyStandard, Q extends S["questions"][number]>(
  supabase: SupabaseClient,
  childId: string,
  gradeStandards: S[],
  options: BuildDeckOptions = {},
): Promise<SharpenDeck<Q> | null> {
  const topN = options.topN ?? 3;
  const perStandard = options.perStandard ?? 3;
  const maxTotal = options.maxTotal ?? 9;

  const weakSpots = await getWeakSpots(supabase, childId, {
    windowDays: 30,
    minAttempts: 5,
    minMissRate: 0.3,
    limit: topN,
  });
  if (weakSpots.length === 0) return null;

  // Index gradeStandards by id for O(1) lookup.
  const byId = new Map(gradeStandards.map((s) => [s.standard_id, s]));

  // Sample `perStandard` questions from each weak standard. Shuffle
  // within standard so a return visit doesn't repeat the same Qs.
  const buckets: Q[][] = [];
  for (const spot of weakSpots) {
    const std = byId.get(spot.standard_id);
    if (!std || std.questions.length === 0) continue;
    const shuffled = [...std.questions].sort(() => Math.random() - 0.5) as Q[];
    buckets.push(shuffled.slice(0, perStandard));
  }
  if (buckets.length === 0) return null;

  // Round-robin merge — first question from each bucket, then second
  // from each, etc. Cap at maxTotal.
  const merged: Q[] = [];
  const maxLen = Math.max(...buckets.map((b) => b.length));
  for (let i = 0; i < maxLen && merged.length < maxTotal; i++) {
    for (const bucket of buckets) {
      if (merged.length >= maxTotal) break;
      if (bucket[i]) merged.push(bucket[i]);
    }
  }

  return { questions: merged, weakSpots };
}
