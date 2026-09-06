"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { proseAndPoem } from "@/app/data/lessons-v2/prose-and-poem";

// FACTORY-AUTHORED lesson · /demo/prose-and-poem
export default function Page() {
  return <LessonRunner lesson={proseAndPoem} />;
}
