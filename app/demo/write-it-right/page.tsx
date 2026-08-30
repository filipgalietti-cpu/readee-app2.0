"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { writeItRight } from "@/app/data/lessons-v2/write-it-right";

// FACTORY-AUTHORED lesson · /demo/write-it-right
export default function Page() {
  return <LessonRunner lesson={writeItRight} />;
}
