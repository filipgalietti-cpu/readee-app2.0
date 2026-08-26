"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { findItFast } from "@/app/data/lessons-v2/find-it-fast";

// FACTORY-AUTHORED lesson · /demo/find-it-fast
export default function Page() {
  return <LessonRunner lesson={findItFast} />;
}
