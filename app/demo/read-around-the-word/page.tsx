"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readAroundTheWord } from "@/app/data/lessons-v2/read-around-the-word";

// FACTORY-AUTHORED lesson · /demo/read-around-the-word
export default function Page() {
  return <LessonRunner lesson={readAroundTheWord} />;
}
