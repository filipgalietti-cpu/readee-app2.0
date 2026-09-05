"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { doesThatMakeSense } from "@/app/data/lessons-v2/does-that-make-sense";

// FACTORY-AUTHORED lesson · /demo/does-that-make-sense
export default function Page() {
  return <LessonRunner lesson={doesThatMakeSense} />;
}
