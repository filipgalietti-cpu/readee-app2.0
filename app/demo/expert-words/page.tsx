"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { expertWords } from "@/app/data/lessons-v2/expert-words";

// FACTORY-AUTHORED lesson · /demo/expert-words
export default function Page() {
  return <LessonRunner lesson={expertWords} />;
}
