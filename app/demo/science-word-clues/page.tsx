"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { scienceWordClues } from "@/app/data/lessons-v2/science-word-clues";

// FACTORY-AUTHORED lesson · /demo/science-word-clues
export default function Page() {
  return <LessonRunner lesson={scienceWordClues} />;
}
