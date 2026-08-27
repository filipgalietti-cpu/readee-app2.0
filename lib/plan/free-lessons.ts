/**
 * Unit-aware free-lesson rule. The free tier unlocks exactly the FIRST UNIT of
 * each grade — matching the journey, where a "unit" is a grade's domain group
 * (RL = "Story Treasures", RI = "Fact Finders", RF = "Sound Workshop",
 * L = "Word Magic"). Unit 1 = the grade's first-appearance domain.
 *
 * Free-ness depends only on a lesson's (grade, domain), NOT its catalog index,
 * so /journey and /learn agree regardless of how each orders lessons.
 */
export interface LessonLite {
  grade: string;
  domain: string;
}

/** grade -> its first unit's domain (first-appearance domain in the catalog). */
export function firstUnitDomainByGrade(lessons: LessonLite[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const l of lessons) if (!m.has(l.grade)) m.set(l.grade, l.domain);
  return m;
}

/** Is this lesson in its grade's first (free) unit? */
export function isLessonInFreeUnit(
  lesson: LessonLite,
  firstDomain: Map<string, string>,
): boolean {
  return firstDomain.get(lesson.grade) === lesson.domain;
}
