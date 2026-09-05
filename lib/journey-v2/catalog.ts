/**
 * V2 CATALOG — the roadmap resolved against what the factory has actually
 * shipped. Server-only: the manifests import every lesson definition.
 *
 * A roadmap unit's lessons are the manifest lessons whose standard is one of
 * the unit's standards (exactly, or as the umbrella of a lettered standard:
 * book-basics teaches RF.K.1 and the roadmap lists RF.K.1a-d). Nothing here
 * invents a lesson: a unit with no shipped lessons has an empty list and the
 * journey leaves it off the map until the factory lands it.
 */
import { LESSONS } from "@/app/data/lessons-v2";
import { QUIZZES } from "@/app/data/quizzes-v2";
import { WARMUP_BY_LESSON } from "@/app/data/warmups-v2";
import { GRADE_FINAL_ID, ROADMAP_UNITS, type Band, type RoadmapUnit } from "./roadmap.gen";

export interface CatalogLesson {
  id: string;
  title: string;
  standard: string;
  warmupId: string | null;
  warmupTitle: string | null;
  quizId: string | null;
  quizTitle: string | null;
}

export interface CatalogUnit extends Omit<RoadmapUnit, "examId"> {
  lessons: CatalogLesson[];
  /** Null until the unit exam is in the quiz manifest. */
  examId: string | null;
  examTitle: string | null;
}

export interface CatalogFinal {
  id: string;
  title: string;
}

/** Does a shipped lesson's standard cover this roadmap standard? */
export function standardCovers(lessonStandard: string, roadmapStandard: string): boolean {
  if (lessonStandard === roadmapStandard) return true;
  // Umbrella: "RF.K.1" covers "RF.K.1a" but never "RF.K.10".
  return roadmapStandard.length === lessonStandard.length + 1 && roadmapStandard.startsWith(lessonStandard) && /[a-z]$/.test(roadmapStandard);
}

let cache: CatalogUnit[] | null = null;

/** Every roadmap unit with its shipped content, in roadmap order. Cached per process. */
export function journeyCatalog(): CatalogUnit[] {
  if (cache) return cache;
  const manifest = Object.values(LESSONS).map((e) => e.lesson);
  cache = ROADMAP_UNITS.map((u) => {
    const lessons: CatalogLesson[] = [];
    for (const std of u.standards) {
      for (const l of manifest) {
        if (l.grade !== u.grade) continue;
        if (!standardCovers(l.standard, std)) continue;
        if (lessons.some((x) => x.id === l.id)) continue;
        const quiz = QUIZZES[`${l.id}-quiz`] ?? null;
        const warmup = WARMUP_BY_LESSON[l.id] ?? null;
        lessons.push({
          id: l.id,
          title: l.title,
          standard: l.standard,
          warmupId: warmup?.id ?? null,
          warmupTitle: warmup?.title ?? null,
          quizId: quiz?.id ?? null,
          quizTitle: quiz?.title ?? null,
        });
      }
    }
    const exam = QUIZZES[u.examId] ?? null;
    return { id: u.id, grade: u.grade, band: u.band, unitNo: u.unitNo, name: u.name, standards: u.standards, lessons, examId: exam?.id ?? null, examTitle: exam?.title ?? null };
  });
  return cache;
}

/** The grade's graduation exam, when the manifest has it. */
export function gradeFinal(band: Band): CatalogFinal | null {
  const q = QUIZZES[GRADE_FINAL_ID[band]];
  return q ? { id: q.id, title: q.title } : null;
}

/** Test seam: rebuild the cache (the manifests are static in production). */
export function resetCatalogCache(): void {
  cache = null;
}
