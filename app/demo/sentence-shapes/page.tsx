"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sentenceShapes } from "@/app/data/lessons-v2/sentence-shapes";

// FACTORY-AUTHORED lesson · /demo/sentence-shapes
export default function Page() {
  return <LessonRunner lesson={sentenceShapes} />;
}
