"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { twoWaysToSee } from "@/app/data/lessons-v2/two-ways-to-see";

// FACTORY-AUTHORED lesson · /demo/two-ways-to-see
export default function Page() {
  return <LessonRunner lesson={twoWaysToSee} />;
}
