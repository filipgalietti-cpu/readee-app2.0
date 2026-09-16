import { LESSON_META } from "@/lib/data/curriculum-manifest";
import { freeJourneyLesson } from "@/lib/journey/lesson-access";
import type { JourneySnapshot } from "@/lib/journey/types";
import { UNIT_ONE, approvedLesson, approvedCoverage } from "./catalogue";
/** Use the live journey policy, including saved placement, legacy allowance and trial. */
export function unitHasAccess(snapshot: JourneySnapshot, id: string): boolean {
  if (snapshot.billing.fullAccess) return true;
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
