/**
 * V2 JOURNEY — the shapes the map, the play route, and the dashboard share.
 *
 * The journey is the roadmap (docs/UNIT_ROADMAP.md) walked from the band the
 * placement chose to the enrolled grade's bar, one unit at a time:
 *   warm-up → lesson → questions, for every lesson in the unit, then the unit
 *   exam, which unveils the next unit. Passing an exam early tests out.
 * Free readers get the unit the placement prescribed (their first unit) end to
 * end; Readee+ gets every unit. Units whose lessons are not in the manifest
 * yet are simply not on the map, so the factory's output appears as it lands.
 */
import type { Band } from "./roadmap.gen";

export type { Band };

export type ItemKind = "warmup" | "lesson" | "quiz" | "exam" | "final";

/** One row of journey_v2_progress. */
export interface ProgressRow {
  item_type: ItemKind;
  item_id: string;
  unit_id: string;
  score: number | null;
  passed: boolean;
  completed_at: string;
  /** "placement" = credited by the placement's evidence, never played. */
  source?: "play" | "placement";
}

/** A dated milestone from the placement plan, shown on the road at the ask. */
export interface RoadMilestone {
  label: string;
  month: string;
  date: string;
}

export interface JourneyItem {
  kind: ItemKind;
  id: string;
  title: string;
  unitId: string;
  /** Completed at least once (for exams: attempted). */
  done: boolean;
  /** Exams and finals: the best attempt cleared the bar. */
  passed: boolean;
  /** Best score, 0-100, when one was recorded. */
  score: number | null;
  /** Reachable on the child's plan (free unit, or Readee+). */
  free: boolean;
  href: string;
}

export interface JourneyLesson {
  id: string;
  title: string;
  standard: string;
  /** In play order: warm-up (when one exists), lesson, questions (when they exist). */
  items: JourneyItem[];
  /** The lesson itself was completed. */
  done: boolean;
}

export type UnitStatus = "done" | "current" | "next" | "upcoming";

export interface JourneyUnit {
  id: string;
  grade: string;
  band: Band;
  unitNo: number;
  name: string;
  status: UnitStatus;
  /** Reachable on the child's plan (the prescribed unit, or Readee+). */
  free: boolean;
  lessons: JourneyLesson[];
  /** The unit exam, when the manifest has one. */
  exam: JourneyItem | null;
  /** The grade's graduation exam, attached to the grade's last unit when it exists. */
  final: JourneyItem | null;
  lessonsDone: number;
  lessonsTotal: number;
  /** Lessons the placement credited and the map hides (not in lessonsTotal). */
  credited: number;
  /** 0-100, lessons done over lessons total (the exam is the gate, not a percent). */
  pct: number;
}

export interface JourneyView {
  childId: string;
  startBand: Band;
  enrolledBand: Band;
  /** The unit the placement prescribed: the free unit, always units[0] when the child has any content. */
  prescribedUnitId: string | null;
  /** Everything the child can see: done units, the current one, and the next one. Fog of war hides the rest. */
  units: JourneyUnit[];
  /** Units with content past the next one, hidden by the fog. */
  hiddenAhead: number;
  /** Roadmap units on the path with no lessons in the manifest yet (the factory is still building them). */
  unbuiltAhead: number;
  /** Units on the path past the enrolled grade's bar (Readee+ keeps going into the catalog). */
  beyondBar: number;
  /** What to do next, or null when the child has finished every unit with content. */
  current: { unit: JourneyUnit; item: JourneyItem } | null;
  fullAccess: boolean;
  /** Where the questions start for this child (from the placement; "core" without one). */
  difficulty: "easier" | "core" | "harder";
  /** Lessons the placement credited across the whole path. */
  credited: number;
  /** Parent-facing "why this plan" lines from the placement, empty without one. */
  why: string[];
  /** Dated milestones from the placement plan, empty without one. */
  milestones: RoadMilestone[];
}
