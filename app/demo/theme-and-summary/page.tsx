"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { themeAndSummary } from "@/app/data/lessons-v2/theme-and-summary";

// FACTORY-AUTHORED lesson · /demo/theme-and-summary
export default function Page() {
  return <LessonRunner lesson={themeAndSummary} />;
}
