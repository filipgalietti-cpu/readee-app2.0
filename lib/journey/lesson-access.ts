import {
  assignedJourneyCatalog,
  type CatalogLesson,
  type PracticeRow,
  type LessonProgRow,
} from "./next-lesson";
import type { PlacementPlan } from "@/lib/placement/types";
import { firstUnitDomainByGrade, isLessonInFreeUnit } from "@/lib/plan/free-lessons";
import { LESSON_META } from "@/lib/data/curriculum-manifest";

// Scheduled after this release: nobody who already received the old allowance
// loses it during deployment. Existing families keep their included units.
export const SAMPLE_ACCESS_START = "2026-09-12T00:00:00.000Z";
export function hasLegacyLessonAllowance(signupAt: string | null | undefined): boolean {
  const created = Date.parse(signupAt ?? "");
  return !Number.isFinite(created) || created < Date.parse(SAMPLE_ACCESS_START);
}
export function lessonCompleted(
  id: string,
  practice: PracticeRow[],
  progress: LessonProgRow[],
): boolean {
  return (
    practice.some((p) => p.standard_id === id && p.questions_correct >= 3) ||
    progress.some((p) => p.lesson_id === id && p.section === "practice" && p.score >= 60)
  );
}
export function freeJourneyLesson(opts: {
  lesson: CatalogLesson;
  signupAt: string | null;
  readingLevel: string | null;
  placement?: PlacementPlan | null;
}): boolean {
  if (hasLegacyLessonAllowance(opts.signupAt))
    return isLessonInFreeUnit(
      opts.lesson,
      firstUnitDomainByGrade(LESSON_META),
      opts.placement?.firstUnit,
    );
  const unit = opts.placement?.firstUnit;
  const first =
    (unit &&
      LESSON_META.find((lesson) => lesson.grade === unit.grade && lesson.domain === unit.domain)) ||
    assignedJourneyCatalog(opts.readingLevel, opts.placement)[0];
  return !!first && first.standardId === opts.lesson.standardId;
}
