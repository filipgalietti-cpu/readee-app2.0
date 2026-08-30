"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { syllableSplitters } from "@/app/data/lessons-v2/syllable-splitters";

// FACTORY-AUTHORED lesson · /demo/syllable-splitters
export default function Page() {
  return <LessonRunner lesson={syllableSplitters} />;
}
