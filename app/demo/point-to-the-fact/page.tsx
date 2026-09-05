"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { pointToTheFact } from "@/app/data/lessons-v2/point-to-the-fact";

// FACTORY-AUTHORED lesson · /demo/point-to-the-fact
export default function Page() {
  return <LessonRunner lesson={pointToTheFact} />;
}
