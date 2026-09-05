/**
 * Item-level helpers shared by the play route and the complete route:
 * where an item lives on the roadmap, and what it pays.
 */
import { gradeFinal, journeyCatalog } from "./catalog";
import type { Band } from "./roadmap.gen";
import type { ItemKind } from "./types";

/** Carrots per finished item. Exams pay on a pass; questions pay by the score. */
export function carrotsFor(kind: ItemKind, score: number | null, passed: boolean): number {
  switch (kind) {
    case "warmup": return 5;
    case "lesson": return 10;
    case "quiz": return score === null ? 5 : Math.max(2, Math.round(score / 10));
    case "exam": return passed ? 25 : 5;
    case "final": return passed ? 50 : 10;
  }
}

/** Where an item lives on the roadmap, or null when the manifest does not know it. */
export function locateItem(kind: ItemKind, id: string): { unitId: string; band: Band } | null {
  const catalog = journeyCatalog();
  for (const u of catalog) {
    if (kind === "exam" && u.examId === id) return { unitId: u.id, band: u.band };
    if (kind === "final") {
      const f = gradeFinal(u.band);
      const lastOfBand = catalog.filter((x) => x.band === u.band && x.lessons.length > 0).at(-1)?.id === u.id;
      if (f && f.id === id && lastOfBand) return { unitId: u.id, band: u.band };
    }
    for (const l of u.lessons) {
      if (kind === "lesson" && l.id === id) return { unitId: u.id, band: u.band };
      if (kind === "warmup" && l.warmupId === id) return { unitId: u.id, band: u.band };
      if (kind === "quiz" && l.quizId === id) return { unitId: u.id, band: u.band };
    }
  }
  return null;
}
