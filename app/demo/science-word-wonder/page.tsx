"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { scienceWordWonder } from "@/app/data/lessons-v2/science-word-wonder";

// FACTORY-AUTHORED lesson · /demo/science-word-wonder
export default function Page() {
  return <LessonRunner lesson={scienceWordWonder} />;
}
