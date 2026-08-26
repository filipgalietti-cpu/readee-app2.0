"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { twoTextsCompare } from "@/app/data/lessons-v2/two-texts-compare";

// FACTORY-AUTHORED lesson · /demo/two-texts-compare
export default function Page() {
  return <LessonRunner lesson={twoTextsCompare} />;
}
