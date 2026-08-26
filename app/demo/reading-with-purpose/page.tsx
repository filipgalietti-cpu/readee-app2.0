"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readingWithPurpose } from "@/app/data/lessons-v2/reading-with-purpose";

// FACTORY-AUTHORED lesson · /demo/reading-with-purpose
export default function Page() {
  return <LessonRunner lesson={readingWithPurpose} />;
}
