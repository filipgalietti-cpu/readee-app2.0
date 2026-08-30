"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sameAndDifferent } from "@/app/data/lessons-v2/same-and-different";

// FACTORY-AUTHORED lesson · /demo/same-and-different
export default function Page() {
  return <LessonRunner lesson={sameAndDifferent} />;
}
