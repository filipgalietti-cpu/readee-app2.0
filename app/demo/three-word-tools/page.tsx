"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { threeWordTools } from "@/app/data/lessons-v2/three-word-tools";

// FACTORY-AUTHORED lesson · /demo/three-word-tools
export default function Page() {
  return <LessonRunner lesson={threeWordTools} />;
}
