"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factWordFinder } from "@/app/data/lessons-v2/fact-word-finder";

// FACTORY-AUTHORED lesson · /demo/fact-word-finder
export default function Page() {
  return <LessonRunner lesson={factWordFinder} />;
}
