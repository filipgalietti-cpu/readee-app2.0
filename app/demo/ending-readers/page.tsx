"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { endingReaders } from "@/app/data/lessons-v2/ending-readers";

// FACTORY-AUTHORED lesson · /demo/ending-readers
export default function Page() {
  return <LessonRunner lesson={endingReaders} />;
}
