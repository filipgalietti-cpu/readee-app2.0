"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { lookItUp } from "@/app/data/lessons-v2/look-it-up";

// FACTORY-AUTHORED lesson · /demo/look-it-up
export default function Page() {
  return <LessonRunner lesson={lookItUp} />;
}
