"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { holdItUp } from "@/app/data/lessons-v2/hold-it-up";

// FACTORY-AUTHORED lesson · /demo/hold-it-up
export default function Page() {
  return <LessonRunner lesson={holdItUp} />;
}
