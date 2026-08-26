"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { longOrShort } from "@/app/data/lessons-v2/long-or-short";

// FACTORY-AUTHORED lesson · /demo/long-or-short
export default function Page() {
  return <LessonRunner lesson={longOrShort} />;
}
