"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { ruleBreakerWords } from "@/app/data/lessons-v2/rule-breaker-words";

// FACTORY-AUTHORED lesson · /demo/rule-breaker-words
export default function Page() {
  return <LessonRunner lesson={ruleBreakerWords} />;
}
