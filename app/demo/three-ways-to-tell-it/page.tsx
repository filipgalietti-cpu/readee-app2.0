"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { threeWaysToTellIt } from "@/app/data/lessons-v2/three-ways-to-tell-it";

// FACTORY-AUTHORED lesson · /demo/three-ways-to-tell-it
export default function Page() {
  return <LessonRunner lesson={threeWaysToTellIt} />;
}
