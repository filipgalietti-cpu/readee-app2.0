"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { longWordsFullSpeed } from "@/app/data/lessons-v2/long-words-full-speed";

// FACTORY-AUTHORED lesson · /demo/long-words-full-speed
export default function Page() {
  return <LessonRunner lesson={longWordsFullSpeed} />;
}
