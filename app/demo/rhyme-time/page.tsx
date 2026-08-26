"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { rhymeTime } from "@/app/data/lessons-v2/rhyme-time";

// FACTORY-AUTHORED lesson · /demo/rhyme-time
export default function Page() {
  return <LessonRunner lesson={rhymeTime} />;
}
