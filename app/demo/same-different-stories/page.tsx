"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sameDifferentStories } from "@/app/data/lessons-v2/same-different-stories";

// FACTORY-AUTHORED lesson · /demo/same-different-stories
export default function Page() {
  return <LessonRunner lesson={sameDifferentStories} />;
}
