"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordLadders } from "@/app/data/lessons-v2/word-ladders";

// FACTORY-AUTHORED lesson · /demo/word-ladders
export default function Page() {
  return <LessonRunner lesson={wordLadders} />;
}
