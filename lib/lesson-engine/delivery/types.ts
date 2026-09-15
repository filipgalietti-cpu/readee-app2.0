import type { SceneDef } from "../types";
export type Outcome =
  | "first-try"
  | "after-help"
  | "after-error"
  | "exhausted"
  | "skipped"
  | "unavailable"
  | "practice";
export type ReadingEvidence = {
  totalWords: number;
  wordsAttempted: number;
  wordsCorrect: number;
  uncertainWords: number;
};
export type ItemEvidence = {
  submissions?: unknown[];
  /** Preview reward snapshot, immutable once completed. */
  carrots?: number;
  rewardOrder?: number;
  streakAfter?: number;
  firstResponse?: "correct" | "incorrect" | "assisted";
  reading?: ReadingEvidence;
  response?: { rubricId: string; verdict: "accepted" };
  attempts: number;
  helped: boolean;
  outcome: Outcome;
  completed: boolean;
  skill: string;
};
export type Evidence = Record<string, ItemEvidence>;
export type ActivitySupport = {
  scene: SceneDef;
  /** Neutral exam presentation; correctness is recorded but not shown during the sitting. */
  deferFeedback?: boolean;
  narration?: {
    caption: string;
    activeWord: number;
    speaking: boolean;
    /** Explicit replay/queued candidate owner; never inferred from caption text. */
    choiceId?: string | null;
    analyser?: AnalyserNode | null;
  };
  say: (text: string, after?: () => void, choiceId?: string) => void;
  stopVoice: () => void;
  capture: (active: boolean) => void;
  help: () => void;
  reflect?: (id: string) => boolean | void;
  answer: (id: string, correct: boolean, submission?: unknown) => boolean | void;
  readPractice: (reading: ReadingEvidence) => void;
  finish: () => void;
  unavailable: () => void;
  visual: (props: Record<string, string | number | boolean>) => void;
  evaluateResponse?: (rubricId: string, transcript: string, confidence: number, signal: AbortSignal, confirmed?: boolean) => Promise<import("../response/rubrics").ResponseVerdict>;
  responsePractice?: (rubricId: string) => void;
  speechToken?: () => Promise<{ token: string; region: string }>;
};
export type AttemptSnapshot = {
  version: 1;
  sessionId: string;
  flowId: string;
  phase: number;
  scene: number;
  evidence: Evidence;
  finished: boolean;
  warmupDone?: boolean;
  warmupAwarded?: number;
};
export interface AttemptStore {
  load(flowId: string): AttemptSnapshot | null;
  save(snapshot: AttemptSnapshot): void;
}
