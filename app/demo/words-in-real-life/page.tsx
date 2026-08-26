"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordsInRealLife } from "@/app/data/lessons-v2/words-in-real-life";

// FACTORY-AUTHORED lesson · /demo/words-in-real-life
export default function Page() {
  return <LessonRunner lesson={wordsInRealLife} />;
}
