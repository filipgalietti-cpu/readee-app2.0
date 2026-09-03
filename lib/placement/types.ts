/**
 * PLACEMENT CONTRACTS - the shapes every placement piece agrees on:
 * the runner (collects evidence + moments), the complete route (decides,
 * plans, narrates, saves), the reveal (renders), the report (prints).
 *
 * decide.ts owns PlacementDecision. This file adds what the reveal needs on
 * top of it: the moments the narration cites, the curated path, the spoken
 * lines, and the saved result. Everything here is JSON-serializable.
 */
import type { Band, PlacedBand, LadderState } from "./ladder";
import type { PlacementDecision, PassageEvidence, CountEvidence, FoundationsEvidence } from "./decide";

/** A thing that happened during the exam that the parent narration can cite. */
export type Moment =
  | { kind: "list-passed"; band: Band; misses: number }
  | { kind: "list-hard"; band: Band; words: string[] }
  | { kind: "list-easy"; band: Band }
  | { kind: "passage-kept-going"; band: Band }
  | { kind: "passage-accurate"; band: Band; accuracy: number }
  | { kind: "passage-slow"; band: Band }
  | { kind: "passage-expressive"; band: Band }
  | { kind: "comprehension"; band: Band; correct: number; total: number }
  | { kind: "foundation"; skill: "letterSounds" | "blending" | "nonsenseWords"; correct: number; total: number };

/** Everything the runner hands to the complete route. */
export type PlacementSubmission = {
  childId: string;
  enrolled: PlacedBand;
  ladder: LadderState;
  passages: PassageEvidence[];
  comprehension: (CountEvidence & { band: Band }) | null;
  foundations: FoundationsEvidence | null;
  moments: Moment[];
  /** Seconds from the first word to the last answer. */
  durationSeconds: number;
  /** Object path of the passage recording in the child-audio bucket, when kept. */
  passageRecordingPath?: string | null;
  /** Client-set for QA robots; the route ignores it unless the caller is an owner. */
  startedAt?: string;
};

export type PlanStepKind = "start" | "skipped" | "target" | "luna" | "end";

export type PlanStep = {
  kind: PlanStepKind;
  /** Short, parent-facing: "2nd-grade words and sounds". */
  title: string;
  /** Why this node is on Maya's path, in one clause: "she already showed us those". */
  reason: string;
  /** The journey unit behind the node, when there is one. */
  unit?: { grade: string; domain: string; lessons: number };
};

export type PlanMilestone = { label: string; month: string; date: string; /** Words a minute the milestone reaches, when the plan has a timed passage. */ wcpm?: number };

export type PlacementPlan = {
  entryBand: PlacedBand;
  steps: PlanStep[];
  /** Lessons the child will actually do (skips excluded). */
  lessons: number;
  weeksAt10Min: number;
  minutesPerDay: number;
  daysPerWeek: number;
  milestones: PlanMilestone[];
  /** The first thing the child does after "Start plan". */
  firstUnit: { grade: string; domain: string; title: string; lessons: number } | null;
  reviewedBy: string;
};

export type NarrationId =
  | "strengths"
  | "number"
  | "placement"
  | "skill-decoding"
  | "skill-fluency"
  | "skill-comprehension"
  | "path"
  /** Who made the lessons on the path and against what; spoken on the path card after the route. */
  | "path-crafted"
  | "plan"
  | "ask";

export type NarrationLine = {
  id: NarrationId;
  /** What the guide says. Parent-facing; house rules apply. */
  text: string;
  /** Object path in the child-audio bucket once synthesized (it says the child's name). */
  audioPath?: string | null;
};

/** The saved result: one row in `placements`, what the reveal and report render. */
export type PlacementResult = {
  id: string;
  childId: string;
  childName: string;
  enrolled: PlacedBand;
  decision: PlacementDecision;
  moments: Moment[];
  plan: PlacementPlan;
  narration: NarrationLine[];
  passageRecordingPath: string | null;
  durationSeconds: number;
  createdAt: string;
};
