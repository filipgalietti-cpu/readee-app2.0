"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { trickyWords } from "@/app/data/lessons-v2/tricky-words";

// FACTORY-AUTHORED lesson · /demo/tricky-words
export default function Page() {
  return <LessonRunner lesson={trickyWords} />;
}
