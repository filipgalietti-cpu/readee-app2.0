"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factLinks } from "@/app/data/lessons-v2/fact-links";

// FACTORY-AUTHORED lesson · /demo/fact-links
export default function Page() {
  return <LessonRunner lesson={factLinks} />;
}
