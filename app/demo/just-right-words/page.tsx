"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { justRightWords } from "@/app/data/lessons-v2/just-right-words";

// FACTORY-AUTHORED lesson · /demo/just-right-words
export default function Page() {
  return <LessonRunner lesson={justRightWords} />;
}
