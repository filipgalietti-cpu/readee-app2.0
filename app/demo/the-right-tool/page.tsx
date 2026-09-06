"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { theRightTool } from "@/app/data/lessons-v2/the-right-tool";

// FACTORY-AUTHORED lesson · /demo/the-right-tool
export default function Page() {
  return <LessonRunner lesson={theRightTool} />;
}
