"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordsForEffect } from "@/app/data/lessons-v2/words-for-effect";

// FACTORY-AUTHORED lesson · /demo/words-for-effect
export default function Page() {
  return <LessonRunner lesson={wordsForEffect} />;
}
