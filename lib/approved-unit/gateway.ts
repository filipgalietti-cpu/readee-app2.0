import type { JourneySnapshot } from "@/lib/journey/types";
import { assignedJourneyCatalog } from "@/lib/journey/next-lesson";
import { UNIT_ONE, approvedStandard, approvedCoverage } from "./catalogue";
export const UNIT_EXAM_ID = "k-unit-1-checkpoint";
/** Only the released, fully assigned mixed-skill unit has a reviewed exam.
 * A targeted subset on an older reader's path must not force all of K on them. */
export function unitGateway(snapshot: JourneySnapshot) {
  const assigned = assignedJourneyCatalog(
    snapshot.child.reading_level ?? null,
    snapshot.result?.plan,
  );
  const applies =
    !!snapshot.approvedUnitEnabled &&
    UNIT_ONE.every((l) =>
      approvedCoverage(l.id).every((standard) => assigned.some((a) => a.standardId === standard)),
    );
  const completed = UNIT_ONE.filter((l) =>
    snapshot.completedStandards?.includes(l.standard),
  ).length;
  const ready = completed === UNIT_ONE.length && snapshot.unitOneExamStatus === "ready";
  return {
    applies,
    completed,
    total: UNIT_ONE.length,
    examAvailable: completed === UNIT_ONE.length,
    ready,
    locked: applies && !ready,
  };
}
export function blockedByUnitExam(snapshot: JourneySnapshot, standard: string) {
  return unitGateway(snapshot).locked && !approvedStandard(standard);
}
