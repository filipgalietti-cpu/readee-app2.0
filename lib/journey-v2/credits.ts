/**
 * PLACEMENT CREDITS — which shipped lessons a placement's passed seeds cover.
 * Server-only (reads the catalog). Used by the placement complete route and
 * the backfill script; the journey then hides those lessons from the map.
 *
 * A seed standard credits a lesson when it IS the lesson's standard or is its
 * umbrella: the "RF.2.3" word-list seed credits RF.2.3 and RF.2.3a-f, because
 * the word lists tested exactly that decoding. Comprehension and fluency
 * seeds (RL.g.1, RF.g.4) credit their own lessons the same way.
 */
import { journeyCatalog, standardCovers } from "./catalog";

export interface CreditedLesson {
  lessonId: string;
  unitId: string;
  standard: string;
  /** The seed that earned it. */
  seed: string;
}

export function creditedLessonsFor(creditedStandards: string[]): CreditedLesson[] {
  const out: CreditedLesson[] = [];
  if (!creditedStandards.length) return out;
  for (const u of journeyCatalog()) {
    for (const l of u.lessons) {
      const seed = creditedStandards.find((s) => s === l.standard || standardCovers(s, l.standard));
      if (seed && !out.some((c) => c.lessonId === l.id)) out.push({ lessonId: l.id, unitId: u.id, standard: l.standard, seed });
    }
  }
  return out;
}

/** The rows the complete route inserts for a credit (idempotent by the caller's delete-then-insert). */
export function creditRows(childId: string, credits: CreditedLesson[]) {
  return credits.map((c) => ({
    child_id: childId,
    item_type: "lesson" as const,
    item_id: c.lessonId,
    unit_id: c.unitId,
    score: null,
    passed: true,
    source: "placement" as const,
  }));
}
