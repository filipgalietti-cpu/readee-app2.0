"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { snapWords } from "@/app/data/lessons-v2/snap-words";

// FACTORY-AUTHORED lesson · /demo/snap-words
export default function Page() {
  return <LessonRunner lesson={snapWords} />;
}
