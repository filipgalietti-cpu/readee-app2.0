"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { checkAndFix } from "@/app/data/lessons-v2/check-and-fix";

// FACTORY-AUTHORED lesson · /demo/check-and-fix
export default function Page() {
  return <LessonRunner lesson={checkAndFix} />;
}
