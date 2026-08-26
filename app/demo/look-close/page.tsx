"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { lookClose } from "@/app/data/lessons-v2/look-close";

// FACTORY-AUTHORED lesson · /demo/look-close
export default function Page() {
  return <LessonRunner lesson={lookClose} />;
}
