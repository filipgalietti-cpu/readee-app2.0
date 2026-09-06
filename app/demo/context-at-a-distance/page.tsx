"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { contextAtADistance } from "@/app/data/lessons-v2/context-at-a-distance";

// FACTORY-AUTHORED lesson · /demo/context-at-a-distance
export default function Page() {
  return <LessonRunner lesson={contextAtADistance} />;
}
