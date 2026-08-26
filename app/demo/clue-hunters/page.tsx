"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { clueHunters } from "@/app/data/lessons-v2/clue-hunters";

// FACTORY-AUTHORED lesson · /demo/clue-hunters
export default function Page() {
  return <LessonRunner lesson={clueHunters} />;
}
