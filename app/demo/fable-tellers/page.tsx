"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { fableTellers } from "@/app/data/lessons-v2/fable-tellers";

// FACTORY-AUTHORED lesson · /demo/fable-tellers
export default function Page() {
  return <LessonRunner lesson={fableTellers} />;
}
