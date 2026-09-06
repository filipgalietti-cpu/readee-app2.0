"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { theShapeOfTheFacts } from "@/app/data/lessons-v2/the-shape-of-the-facts";

// FACTORY-AUTHORED lesson · /demo/the-shape-of-the-facts
export default function Page() {
  return <LessonRunner lesson={theShapeOfTheFacts} />;
}
