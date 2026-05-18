/**
 * Adaptive review — rank a kid's weakest standards by miss rate.
 *
 * Reads `practice_answers` (one row per answered question, captured by
 * the practice CompletionScreen save effect). Groups by standard_id,
 * filters for enough data to trust the signal, and returns the worst
 * standards so the dashboard can surface "Sharpen Up" targeted practice.
 *
 * The data layer is plan-agnostic — we record per-answer rows for every
 * kid so the QC pipeline + content caps can also pivot on real miss
 * rates. The PREMIUM gate lives in the UI (only Readee+ accounts see
 * the Sharpen Up tile + targeted practice action).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type WeakSpot = {
  standard_id: string;
  attempts: number;
  correct: number;
  /** 0..1 — fraction of attempts the kid got right. */
  accuracy: number;
  /** 0..1 — fraction the kid got wrong. Sort key. */
  miss_rate: number;
};

export type WeakSpotOptions = {
  /** Lookback window in days. Default 30 — improving kids shed old weak spots. */
  windowDays?: number;
  /** Minimum attempts on a standard before flagging it. Below this we
   *  don't trust the signal. Default 5. */
  minAttempts?: number;
  /** Minimum miss rate to qualify. Default 0.3 (30% wrong). */
  minMissRate?: number;
  /** Max results to return. Default 10. */
  limit?: number;
};

export async function getWeakSpots(
  supabase: SupabaseClient,
  childId: string,
  opts: WeakSpotOptions = {},
): Promise<WeakSpot[]> {
  const windowDays = opts.windowDays ?? 30;
  const minAttempts = opts.minAttempts ?? 5;
  const minMissRate = opts.minMissRate ?? 0.3;
  const limit = opts.limit ?? 10;

  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const { data, error } = await supabase
    .from("practice_answers")
    .select("standard_id, was_correct")
    .eq("child_id", childId)
    .gte("answered_at", since.toISOString());

  if (error) {
    console.error("[adaptive] failed to load practice_answers:", error);
    return [];
  }
  if (!data || data.length === 0) return [];

  // Group answers by standard, count attempts + correct.
  const tally = new Map<string, { attempts: number; correct: number }>();
  for (const row of data) {
    const cur = tally.get(row.standard_id) ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (row.was_correct) cur.correct += 1;
    tally.set(row.standard_id, cur);
  }

  const spots: WeakSpot[] = [];
  for (const [standard_id, s] of tally.entries()) {
    if (s.attempts < minAttempts) continue;
    const accuracy = s.correct / s.attempts;
    const miss_rate = 1 - accuracy;
    if (miss_rate < minMissRate) continue;
    spots.push({ standard_id, attempts: s.attempts, correct: s.correct, accuracy, miss_rate });
  }

  return spots.sort((a, b) => b.miss_rate - a.miss_rate).slice(0, limit);
}

/**
 * WeakType — kid struggles with a specific question MODALITY, not a
 * specific standard. e.g. a kid might ace MCQs across the board but
 * bomb sentence_build / sound_machine. Useful to surface separately
 * because the fix is different — practice that modality, not that
 * standard.
 */
export type WeakType = {
  /** mcq | sentence_build | category_sort | tap_to_pair | sound_machine | missing_word | space_insertion */
  type: string;
  attempts: number;
  correct: number;
  accuracy: number;
  miss_rate: number;
};

export async function getWeakTypes(
  supabase: SupabaseClient,
  childId: string,
  opts: WeakSpotOptions = {},
): Promise<WeakType[]> {
  const windowDays = opts.windowDays ?? 30;
  // Modalities are coarser than standards (7 types vs ~50 standards),
  // so we need fewer attempts to trust the signal — default min 10.
  const minAttempts = opts.minAttempts ?? 10;
  const minMissRate = opts.minMissRate ?? 0.3;
  const limit = opts.limit ?? 5;

  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const { data, error } = await supabase
    .from("practice_answers")
    .select("type, was_correct")
    .eq("child_id", childId)
    .gte("answered_at", since.toISOString());

  if (error) {
    console.error("[adaptive] failed to load practice_answers for types:", error);
    return [];
  }
  if (!data || data.length === 0) return [];

  const tally = new Map<string, { attempts: number; correct: number }>();
  for (const row of data) {
    const t = row.type || "mcq";
    const cur = tally.get(t) ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (row.was_correct) cur.correct += 1;
    tally.set(t, cur);
  }

  const types: WeakType[] = [];
  for (const [type, s] of tally.entries()) {
    if (s.attempts < minAttempts) continue;
    const accuracy = s.correct / s.attempts;
    const miss_rate = 1 - accuracy;
    if (miss_rate < minMissRate) continue;
    types.push({ type, attempts: s.attempts, correct: s.correct, accuracy, miss_rate });
  }

  return types.sort((a, b) => b.miss_rate - a.miss_rate).slice(0, limit);
}

/**
 * Friendly display label for a question type. Kids/parents don't read
 * "sentence_build" — they read "Sentence builder".
 */
export function questionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    mcq: "Multiple choice",
    sentence_build: "Sentence builder",
    category_sort: "Category sort",
    tap_to_pair: "Tap to pair",
    sound_machine: "Sound machine",
    missing_word: "Missing word",
    space_insertion: "Space the words",
  };
  return map[type] ?? type;
}
