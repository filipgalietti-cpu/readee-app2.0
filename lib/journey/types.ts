import type { Child } from "@/lib/db/types";
import type { PlacementResult } from "@/lib/placement/types";
import type { PracticeRow, LessonProgRow } from "./next-lesson";

export type JourneySnapshot = {
  child: Child;
  result: PlacementResult | null;
  practice: PracticeRow[];
  lessonProgress: LessonProgRow[];
  billing: { fullAccess: boolean; eligibleForTrial: boolean; signupAt: string | null };
};
