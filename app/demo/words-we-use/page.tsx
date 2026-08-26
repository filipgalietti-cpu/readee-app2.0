"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordsWeUse } from "@/app/data/lessons-v2/words-we-use";

// FACTORY-AUTHORED lesson · /demo/words-we-use
export default function Page() {
  return <LessonRunner lesson={wordsWeUse} />;
}
