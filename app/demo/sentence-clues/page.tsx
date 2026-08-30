"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sentenceClues } from "@/app/data/lessons-v2/sentence-clues";

// FACTORY-AUTHORED lesson · /demo/sentence-clues
export default function Page() {
  return <LessonRunner lesson={sentenceClues} />;
}
