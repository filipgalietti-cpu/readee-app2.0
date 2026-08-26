"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordMusic } from "@/app/data/lessons-v2/word-music";

// FACTORY-AUTHORED lesson · /demo/word-music
export default function Page() {
  return <LessonRunner lesson={wordMusic} />;
}
