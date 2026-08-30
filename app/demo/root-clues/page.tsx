"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { rootClues } from "@/app/data/lessons-v2/root-clues";

// FACTORY-AUTHORED lesson · /demo/root-clues
export default function Page() {
  return <LessonRunner lesson={rootClues} />;
}
