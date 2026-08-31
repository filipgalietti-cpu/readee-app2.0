"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { readItOutLoud } from "@/app/data/lessons-v2/read-it-out-loud";

// FACTORY-AUTHORED lesson · /demo/read-it-out-loud
export default function Page() {
  return <LessonRunner lesson={readItOutLoud} />;
}
