import type { SavedLessonStats } from "@/lib/approved-unit/lesson-stats";
import type { Child } from "@/lib/db/types";
import type { PlacementResult } from "@/lib/placement/types";
import type { PracticeRow, LessonProgRow } from "./next-lesson";

export type JourneySnapshot = {
  child: Child;
  approvedUnitEnabled?: boolean;
  unitOneExamStatus?: "ready" | "practice" | "more-evidence";
  completedStandards?: string[];
  lessonStats?: Record<string, SavedLessonStats>;
  result: PlacementResult | null;
  practice: PracticeRow[];
  lessonProgress: LessonProgRow[];
  billing: { fullAccess: boolean; eligibleForTrial: boolean; signupAt: string | null };
};
