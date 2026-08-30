"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordMath } from "@/app/data/lessons-v2/word-math";

// FACTORY-AUTHORED lesson · /demo/word-math
export default function Page() {
  return <LessonRunner lesson={wordMath} />;
}
