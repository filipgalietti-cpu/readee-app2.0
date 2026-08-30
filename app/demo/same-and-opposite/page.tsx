"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sameAndOpposite } from "@/app/data/lessons-v2/same-and-opposite";

// FACTORY-AUTHORED lesson · /demo/same-and-opposite
export default function Page() {
  return <LessonRunner lesson={sameAndOpposite} />;
}
