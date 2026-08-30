"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { soundItOut } from "@/app/data/lessons-v2/sound-it-out";

// FACTORY-AUTHORED lesson · /demo/sound-it-out
export default function Page() {
  return <LessonRunner lesson={soundItOut} />;
}
