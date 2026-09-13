import type { CurriculumRelease, SourceReference } from "@/lib/curriculum/release";
import type { PlacementPlan } from "@/lib/placement/types";
import type { LearnerEvidence } from "./evidence-contract";
import type { InstructionalTargetMapping } from "./instructional-mappings";

/** Educational input only. Billing and access are intentionally outside this contract. */
export type JourneyPlannerInput = {
  learnerEvidence: LearnerEvidence;
  curriculumRelease: CurriculumRelease;
  approvedMappings: readonly InstructionalTargetMapping[];
  // Retains the historical grade/domain starting intent, not an executable unit mapping.
  savedPlacementPlan: PlacementPlan | null;
  existingJourney: JourneyDefinition | null;
};

// Prerequisite/review/reassessment reasons are deferred until their policies and data exist.
export type JourneyReason =
  | {
      category: "assessment-selected-starting-unit" | "provisional-follow-up";
      evidence: SourceReference[];
      mappingId: string;
      mappingVersion: string;
    }
  | {
      category: "measured-instructional-need";
      evidence: SourceReference[];
      mappingId: string;
      mappingVersion: string;
    }
  | { category: "normal-curriculum-sequence"; curriculumSource: SourceReference }
  | { category: "checkpoint"; checkpointId: string; curriculumSource: SourceReference };
export type PlannedJourneyLesson = {
  nodeId: string;
  lessonId: string;
  slug: string;
  contentVersion: string;
  unitId: string;
  standardIds: string[];
  reason: JourneyReason;
  parentExplanation: string;
  explanationTemplateVersion: string;
  ruleVersion: string;
};
export type JourneyDefinition = {
  schemaVersion: 1;
  plannerVersion: string;
  curriculumReleaseId: string;
  sourcePlacementId: string | null;
  learnerAdapterVersion: LearnerEvidence["adapterVersion"];
  lessons: PlannedJourneyLesson[];
};
export type JourneyPlanningResult =
  | { status: "planned"; definition: JourneyDefinition }
  | {
      status: "blocked";
      reasons: (
        | "curriculum-unreleased"
        | "mapping-review-required"
        | "identity-unresolved"
        | "evidence-insufficient"
      )[];
    };
