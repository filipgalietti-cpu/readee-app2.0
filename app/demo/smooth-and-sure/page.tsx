"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { smoothAndSure } from "@/app/data/lessons-v2/smooth-and-sure";

// FACTORY-AUTHORED lesson · /demo/smooth-and-sure
export default function Page() {
  return <LessonRunner lesson={smoothAndSure} />;
}
