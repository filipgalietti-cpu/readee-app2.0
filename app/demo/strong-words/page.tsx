"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { strongWords } from "@/app/data/lessons-v2/strong-words";

// FACTORY-AUTHORED lesson · /demo/strong-words
export default function Page() {
  return <LessonRunner lesson={strongWords} />;
}
