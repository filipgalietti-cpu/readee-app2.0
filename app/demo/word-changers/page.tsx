"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordChangers } from "@/app/data/lessons-v2/word-changers";

// FACTORY-AUTHORED lesson · /demo/word-changers
export default function Page() {
  return <LessonRunner lesson={wordChangers} />;
}
