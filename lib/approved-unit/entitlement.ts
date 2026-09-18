import { LESSON_META } from "@/lib/data/curriculum-manifest";
import { freeJourneyLesson } from "@/lib/journey/lesson-access";
import type { JourneySnapshot } from "@/lib/journey/types";
import { UNIT_ONE, approvedLesson, approvedCoverage } from "./catalogue";
/**
 * How many lessons of the approved unit a free family opens, in the unit's own
 * order. Filip, 17 Sep: "give them the first few free then hit them with the
 * paywall".
 *
 * ‼️ THIS EXISTS BECAUSE THE FIRST LESSON WAS THE LOCKED ONE. The journey rule
 * unlocks the first lesson of the unit the assessment ASSIGNED, found by
 * (grade, domain) in the curriculum manifest. The approved Kindergarten unit
 * deliberately mixes domains: rhyme-time is RF.K.2a, key-details is RL.K.1,
 * big-kid-words is K.L.6. So when a placement assigned Kindergarten / Reading
 * Literature, the single unlocked standard was RL.K.1, which is the SECOND
 * tile. A parent opened the unit, found tile one locked and tile two free, and
 * reasonably concluded the whole thing was paywalled.
 *
 * A domain-scoped rule can never unlock a deliberately cross-domain unit in the
 * right order, so this surface counts along UNIT_ONE itself instead.
 */
export const FREE_APPROVED_LESSONS = 3;

/** Use the live journey policy, including saved placement, legacy allowance and trial. */
export function unitHasAccess(snapshot: JourneySnapshot, id: string): boolean {
  if (snapshot.billing.fullAccess) return true;
  // The opening lessons are free in the order the child meets them. The
  // checkpoint is not one of them: it covers the whole unit, so it stays behind
  // the same rule as the lessons it tests.
  if (id !== "k-unit-1-checkpoint") {
    const position = UNIT_ONE.findIndex((l) => l.id === id);
    if (position >= 0 && position < FREE_APPROVED_LESSONS) return true;
  }
  const standards =
    id === "k-unit-1-checkpoint" ? UNIT_ONE.map((l) => l.standard) : [approvedLesson(id)?.standard];
  return standards.every((standard) => {
    const lesson = LESSON_META.find(
      (l) =>
        l.standardId === standard ||
        (standard === "RF.K.1" && approvedCoverage("book-basics").includes(l.standardId)),
    );
    return (
      !!lesson &&
      freeJourneyLesson({
        lesson,
        signupAt: snapshot.billing.signupAt,
        readingLevel: snapshot.child.reading_level ?? null,
        placement: snapshot.result?.plan,
      })
    );
  });
}
