"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { mainIdeaAndSummary } from "@/app/data/lessons-v2/main-idea-and-summary";

// FACTORY-AUTHORED lesson · /demo/main-idea-and-summary
export default function Page() {
  return <LessonRunner lesson={mainIdeaAndSummary} />;
}
