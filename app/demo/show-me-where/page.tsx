"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { showMeWhere } from "@/app/data/lessons-v2/show-me-where";

// FACTORY-AUTHORED lesson · /demo/show-me-where
export default function Page() {
  return <LessonRunner lesson={showMeWhere} />;
}
