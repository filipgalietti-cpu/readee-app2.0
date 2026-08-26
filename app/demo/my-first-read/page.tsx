"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { myFirstRead } from "@/app/data/lessons-v2/my-first-read";

// FACTORY-AUTHORED lesson · /demo/my-first-read
export default function Page() {
  return <LessonRunner lesson={myFirstRead} />;
}
