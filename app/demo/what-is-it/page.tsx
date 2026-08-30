"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whatIsIt } from "@/app/data/lessons-v2/what-is-it";

// FACTORY-AUTHORED lesson · /demo/what-is-it
export default function Page() {
  return <LessonRunner lesson={whatIsIt} />;
}
