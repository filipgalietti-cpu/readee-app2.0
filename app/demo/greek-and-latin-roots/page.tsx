"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { greekAndLatinRoots } from "@/app/data/lessons-v2/greek-and-latin-roots";

// FACTORY-AUTHORED lesson · /demo/greek-and-latin-roots
export default function Page() {
  return <LessonRunner lesson={greekAndLatinRoots} />;
}
