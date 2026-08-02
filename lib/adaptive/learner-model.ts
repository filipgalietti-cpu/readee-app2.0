/**
 * Learner Model — ONE always-current profile of a child's strengths and
 * weaknesses, composed from every signal the app already collects. This is
 * the backbone of Readee's personalization: Luna, the daily plan, targeted
 * practice, and the parent report all read from this instead of each
 * re-aggregating raw tables ad hoc.
 *
 * It does NOT introduce a new store — it reads what's already written:
 *   - child_skill_memory   per-standard mastery (SM-2, trigger-maintained)
 *   - practice_answers     recent weak standards + weak question modalities
 *   - fluency_readings     reading speed + weak phonics patterns (Luna)
 *   - assessments          the placement 5-axis profile (cold-start seed)
 *
 * Everything is read-only + reuses lib/adaptive/weak-spots.ts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getWeakSpots, getWeakTypes, type WeakSpot, type WeakType } from "./weak-spots";

export type SkillAxis =
  | "phonics"
  | "vocabulary"
  | "literal_comprehension"
  | "inferential_comprehension"
  | "fluency";

export const SKILL_AXES: SkillAxis[] = [
  "phonics",
  "vocabulary",
  "literal_comprehension",
  "inferential_comprehension",
  "fluency",
];

export const AXIS_LABEL: Record<SkillAxis, string> = {
  phonics: "Phonics & decoding",
  vocabulary: "Vocabulary & language",
  literal_comprehension: "Finding key details",
  inferential_comprehension: "Deeper comprehension",
  fluency: "Reading fluency",
};

export type AxisScore = {
  /** 0..1 mastery, or null when we have no signal for this axis yet. */
  mastery: number | null;
  /** Where the number came from — real practice vs the placement seed. */
  source: "data" | "seed" | "none";
};

export type StandardMastery = {
  standardId: string;
  accuracy: number; // 0..1 lifetime
  attempts: number;
  consecutiveCorrect: number;
  nextDue: string | null;
};

export type LearnerModel = {
  childId: string;
  /** 5-axis skill radar. */
  dimensions: Record<SkillAxis, AxisScore>;
  /** Per-standard mastery (from child_skill_memory). */
  masteryByStandard: StandardMastery[];
  /** Weakest standards by recent miss rate (last 30d). */
  weakStandards: WeakSpot[];
  /** Weakest question modalities. */
  weakTypes: WeakType[];
  /** Weak phonics patterns Luna has flagged (from latest fluency reading). */
  weakPatterns: string[];
  /** Latest reading fluency snapshot. */
  fluency: { wcpm: number | null; accuracy: number | null } | null;
  /** Standards the child has clearly mastered (high accuracy, enough reps). */
  strengths: string[];
  /** What a tutor should target next — the actionable summary Luna reads. */
  focus: { patterns: string[]; standards: string[] };
};

/** The CCSS domain token in a standard id (RF/RL/RI/L/W/SL), or null if it
 *  isn't a real CCSS id (e.g. a story slug that leaked into a skill table). */
export function ccssDomain(standardId: string): string | null {
  for (const p of standardId.split(".")) {
    const u = p.toUpperCase();
    if (["RF", "RL", "RI", "L", "W", "SL"].includes(u)) return u;
  }
  return null;
}

/** Which of the 5 axes a CCSS standard id rolls up into. */
export function standardToAxis(standardId: string): SkillAxis {
  const domain = ccssDomain(standardId) ?? "";
  if (domain === "RF") return "phonics";
  if (domain === "L") return "vocabulary";
  if (domain === "RL" || domain === "RI") {
    const m = standardId.match(/\.(\d+)[a-z]?$/);
    const n = m ? parseInt(m[1], 10) : 1;
    return n <= 1 ? "literal_comprehension" : "inferential_comprehension";
  }
  return "vocabulary";
}

export async function getLearnerModel(
  supabase: SupabaseClient,
  childId: string,
): Promise<LearnerModel> {
  const [skillRows, weakStandards, weakTypes, fluencyRow, assessmentRow] = await Promise.all([
    supabase
      .from("child_skill_memory")
      .select("standard_id, total_correct, total_attempted, consecutive_correct, next_due")
      .eq("child_id", childId),
    getWeakSpots(supabase, childId),
    getWeakTypes(supabase, childId),
    supabase
      .from("fluency_readings")
      .select("wcpm, words_correct, words_total, target_patterns, created_at")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("assessments")
      .select("dimension_profile, created_at")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // ── Per-standard mastery from the SM-2 store ──
  const masteryByStandard: StandardMastery[] = ((skillRows.data ?? []) as any[]).map((r) => ({
    standardId: r.standard_id,
    accuracy: r.total_attempted > 0 ? r.total_correct / r.total_attempted : 0,
    attempts: r.total_attempted ?? 0,
    consecutiveCorrect: r.consecutive_correct ?? 0,
    nextDue: r.next_due ?? null,
  }));

  // ── Roll standards into the 5 axes (mastery = avg accuracy, ≥3 attempts) ──
  const axisAgg: Record<SkillAxis, { sum: number; n: number }> = {
    phonics: { sum: 0, n: 0 }, vocabulary: { sum: 0, n: 0 },
    literal_comprehension: { sum: 0, n: 0 }, inferential_comprehension: { sum: 0, n: 0 },
    fluency: { sum: 0, n: 0 },
  };
  for (const s of masteryByStandard) {
    if (s.attempts < 3) continue;
    if (!ccssDomain(s.standardId)) continue; // ignore non-CCSS ids (e.g. legacy story slugs)
    const axis = standardToAxis(s.standardId);
    axisAgg[axis].sum += s.accuracy;
    axisAgg[axis].n += 1;
  }

  // Fluency axis from the latest reading (accuracy), not standards.
  const fl = fluencyRow.data as any | null;
  const flAccuracy = fl && fl.words_total > 0 ? fl.words_correct / fl.words_total : null;
  const fluency = fl ? { wcpm: fl.wcpm != null ? Number(fl.wcpm) : null, accuracy: flAccuracy } : null;
  if (flAccuracy != null) { axisAgg.fluency.sum += flAccuracy; axisAgg.fluency.n += 1; }

  // Placement 5-axis profile — the cold-start seed for axes with no data yet.
  const seed = (assessmentRow.data as any)?.dimension_profile as
    | Record<string, { scorePercent?: number } | null>
    | undefined;

  const dimensions = {} as Record<SkillAxis, AxisScore>;
  for (const axis of SKILL_AXES) {
    const agg = axisAgg[axis];
    if (agg.n > 0) {
      dimensions[axis] = { mastery: agg.sum / agg.n, source: "data" };
    } else {
      const seedPct = seed?.[axis]?.scorePercent;
      dimensions[axis] = seedPct != null
        ? { mastery: seedPct / 100, source: "seed" }
        : { mastery: null, source: "none" };
    }
  }

  const weakPatterns: string[] = Array.isArray(fl?.target_patterns)
    ? (fl!.target_patterns as any[]).map((p) => String(p)).slice(0, 5)
    : [];

  const strengths = masteryByStandard
    .filter((s) => s.attempts >= 4 && s.accuracy >= 0.85)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5)
    .map((s) => s.standardId);

  return {
    childId,
    dimensions,
    masteryByStandard,
    weakStandards,
    weakTypes,
    weakPatterns,
    fluency,
    strengths,
    focus: {
      patterns: weakPatterns,
      standards: weakStandards.slice(0, 3).map((w) => w.standard_id),
    },
  };
}
