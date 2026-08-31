"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { letterPerfect } from "@/app/data/lessons-v2/letter-perfect";

// FACTORY-AUTHORED lesson · /demo/letter-perfect
export default function Page() {
  return <LessonRunner lesson={letterPerfect} />;
}
