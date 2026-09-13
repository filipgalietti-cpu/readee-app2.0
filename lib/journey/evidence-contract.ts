import type { SourceReference } from "@/lib/curriculum/release";

export type EvidenceSupport = "A-directly-measured" | "B-broad-inference" | "C-unsupported";
export type Evidence<T> =
  | {
      status: "confirmed" | "provisional";
      support: Exclude<EvidenceSupport, "C-unsupported">;
      value: T;
      provenance: SourceReference[];
    }
  | {
      status: "missing" | "unsupported";
      support: "C-unsupported";
      reason: string;
      provenance: SourceReference[];
    };
export type Band = 0 | 1 | 2 | 3 | 4;
export type Counts = { correct: number; total: number };
export type StandardObservation = {
  standardId: string;
  modality: "word-probe" | "listening-supported" | "practice";
  itemId: string;
  correct: boolean | null;
  choiceId?: string;
  standardAttribution: "recorded-with-response" | "current-authored-bank-unverified-for-history";
  provenance: SourceReference;
  interpretation: "sample-response-only";
};
export type PreviousCompletion = {
  standardId: string;
  source: "practice_results" | "lessons_progress";
  sourceId: string;
  completedAt: string | null;
  basis: "existing-journey-completion-rule";
  mastery: "not-established";
};
export type LearnerEvidence = {
  schemaVersion: 1;
  adapterVersion: "learner-evidence-v1";
  childId: string;
  enrollment: Evidence<Band>;
  placementId: string | null;
  instructionalEntry: Evidence<Band>;
  wordReading: Evidence<{ band: Band; step: number | null; label: string; sample: Counts | null }>;
  letterSounds: Evidence<Counts>;
  oralBlending: Evidence<Counts>;
  independentReading: Evidence<{ band: Band | null; supportedSinglePassageBand: Band | null }>;
  comprehension: Evidence<Counts>;
  readingSamples: Evidence<
    {
      band: number;
      wordsCorrect: number;
      wordsAttempted: number;
      referenceWords: number;
      accuracy: number;
      coverage: number;
      correct: number;
      total: number;
    }[]
  >;
  listening: Evidence<{ supportedBand: Band | null; byBand: Counts[] }>;
  fluency: Evidence<{
    band: number;
    wcpm: number;
    accuracy: number;
    interpretation: "observed-sample-only";
  }>;
  reportedStrengths: string[];
  reportedNeeds: string[];
  standardObservations: StandardObservation[];
  previousCompletions: PreviousCompletion[];
  standardMastery: Evidence<never>;
  specificPatternDeficiencies: Evidence<never>;
  issues: string[];
};
