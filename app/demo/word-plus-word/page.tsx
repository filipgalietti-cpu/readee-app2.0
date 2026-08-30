"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordPlusWord } from "@/app/data/lessons-v2/word-plus-word";

// FACTORY-AUTHORED lesson · /demo/word-plus-word
export default function Page() {
  return <LessonRunner lesson={wordPlusWord} />;
}
