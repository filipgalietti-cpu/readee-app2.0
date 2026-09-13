import snapshot from "@/docs/curriculum-pilot/g1-u1/package.json";
import { CurriculumReleaseSchema, type CurriculumInventory } from "@/lib/curriculum/release";
import {
  normalizeLearnerEvidence,
  type LearnerEvidenceInput,
} from "@/lib/journey/learner-evidence";
import { spectrumSubmission } from "./placement-spectrum";
import { readingSearch } from "@/lib/placement/spectrum";
import { decidePlacement } from "@/lib/placement/decide";
import { validatePlacementEvidence } from "@/lib/placement/validate-evidence";
import { PlacementSubmissionSchema } from "@/lib/schemas/placement";
import type { PlacementSubmission } from "@/lib/placement/types";

export const pilotRelease = CurriculumReleaseSchema.parse(snapshot.release);
export const pilotInventory: CurriculumInventory = snapshot.inventory;
export const pilotFixtureNames = [
  "appropriate",
  "below",
  "above",
  "provisional",
  "partial",
  "completed",
  "above-enrollment",
] as const;
export type PilotFixtureName = (typeof pilotFixtureNames)[number];

/** Synthetic children only. Every response sequence must pass production replay validation. */
export function pilotFixture(name: PilotFixtureName) {
  let submission =
    name === "below"
      ? spectrumSubmission(1, 1, 0, 0, "school-first")
      : name === "above"
        ? spectrumSubmission(1, 5, 2, 2, "school-first")
        : spectrumSubmission(name === "above-enrollment" ? 0 : 1, 3, 1, 1, "school-first");
  if (name === "provisional") {
    const ev = submission.spectrum!;
    ev.reading = [];
    ev.readingStopped = {
      passageId: readingSearch(1, ev.words, [], undefined, ev.readingEntry).next!.id,
      reason: "child-pass",
    };
  }
  submission = validatePlacementEvidence(
    PlacementSubmissionSchema.parse(submission) as PlacementSubmission,
    submission.enrolled,
  );
  const source: LearnerEvidenceInput = {
    childId: submission.childId,
    enrollmentBand: submission.enrolled,
    knownStandardIds: pilotInventory.standardIds,
    placement: {
      id: `synthetic-pilot-${name}`,
      childId: submission.childId,
      enrolled: submission.enrolled,
      createdAt: "2026-09-11T12:00:00Z",
      decision: decidePlacement({ ...submission, date: new Date("2026-09-11T12:00:00Z") }),
      evidence: submission,
    },
  };
  if (name === "partial" || name === "completed") {
    const completed = pilotRelease.lessons.slice(0, name === "partial" ? 3 : 10);
    source.progress = {
      childId: submission.childId,
      practice: completed
        .filter((_, i) => i % 2 === 0)
        .map((l) => ({
          id: `legacy-practice-${l.lessonId}`,
          standard_id: l.coverage.standardIds[0],
          questions_correct: 3,
          completed_at: "2026-08-01T12:00:00Z",
        })),
      sections: completed
        .filter((_, i) => i % 2 === 1)
        .map((l) => ({
          id: `legacy-section-${l.lessonId}`,
          lesson_id: l.coverage.standardIds[0],
          section: "practice",
          score: 60,
          completed_at: "2026-08-02T12:00:00Z",
        })),
      answers: [],
    };
  }
  return {
    submission,
    source,
    learnerEvidence: normalizeLearnerEvidence(source),
    curriculumRelease: structuredClone(pilotRelease),
    inventory: structuredClone(pilotInventory),
  };
}
