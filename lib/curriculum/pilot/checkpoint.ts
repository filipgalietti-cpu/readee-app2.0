import type { SourceReference } from "../release";

/** Future persistence contract only. Not connected to QuizRunner or a database. */
export type PilotCheckpointEvidence = {
  schemaVersion: 1;
  childId: string;
  sessionId: string;
  checkpointId: "g1-unit-1-exam";
  contentVersion: string;
  completedAt: string;
  responses: {
    questionId: string;
    sourceQuizId: string;
    standardId: string;
    attempts: number;
    firstAttemptCorrect: boolean | null;
    eventualCorrect: boolean | null;
    status: "measured" | "unmeasured";
    provenance: SourceReference;
  }[];
  interpretation: "sample-response-evidence-only";
  thresholdPolicy: null;
  // Neither completing the exam nor any arbitrary percentage earns mastery.
  mastery: "not-established";
};
