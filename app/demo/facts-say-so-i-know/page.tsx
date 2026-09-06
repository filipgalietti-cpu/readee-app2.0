"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factsSaySoIKnow } from "@/app/data/lessons-v2/facts-say-so-i-know";

// FACTORY-AUTHORED lesson · /demo/facts-say-so-i-know
export default function Page() {
  return <LessonRunner lesson={factsSaySoIKnow} />;
}
