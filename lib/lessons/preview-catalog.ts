import "server-only";
import sampleLessons from "@/app/data/sample-lessons.json";
import { firstUnitDomainByGrade, isLessonInFreeUnit } from "@/lib/plan/free-lessons";
import { v2LessonForStandard } from "./v2-lookup";

// The same five unscored samples shown in Explore. A query parameter cannot
// open the other lessons in a free unit or in a child's paid journey.
const freeUnits = firstUnitDomainByGrade(sampleLessons);
export const previewLessons = [...freeUnits.keys()]
  .map((grade) =>
    sampleLessons.find(
      (lesson) =>
        lesson.grade === grade &&
        isLessonInFreeUnit(lesson, freeUnits) &&
        v2LessonForStandard(lesson.standardId),
    ),
  )
  .filter((lesson) => lesson !== undefined);
