"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordBreakers } from "@/app/data/lessons-v2/word-breakers";

// FACTORY-AUTHORED lesson · /demo/word-breakers
export default function Page() {
  return <LessonRunner lesson={wordBreakers} />;
}
