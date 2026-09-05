"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { partsThatBuild } from "@/app/data/lessons-v2/parts-that-build";

// FACTORY-AUTHORED lesson · /demo/parts-that-build
export default function Page() {
  return <LessonRunner lesson={partsThatBuild} />;
}
