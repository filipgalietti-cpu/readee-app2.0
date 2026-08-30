"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whosTellingIt } from "@/app/data/lessons-v2/whos-telling-it";

// FACTORY-AUTHORED lesson · /demo/whos-telling-it
export default function Page() {
  return <LessonRunner lesson={whosTellingIt} />;
}
