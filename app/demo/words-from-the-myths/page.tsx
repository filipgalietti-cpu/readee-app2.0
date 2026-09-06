"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordsFromTheMyths } from "@/app/data/lessons-v2/words-from-the-myths";

// FACTORY-AUTHORED lesson · /demo/words-from-the-myths
export default function Page() {
  return <LessonRunner lesson={wordsFromTheMyths} />;
}
