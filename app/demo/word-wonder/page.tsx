"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordWonder } from "@/app/data/lessons-v2/word-wonder";

// FACTORY-AUTHORED lesson · /demo/word-wonder
export default function Page() {
  return <LessonRunner lesson={wordWonder} />;
}
