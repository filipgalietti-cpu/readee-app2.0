"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { clickAndClunk } from "@/app/data/lessons-v2/click-and-clunk";

// FACTORY-AUTHORED lesson · /demo/click-and-clunk
export default function Page() {
  return <LessonRunner lesson={clickAndClunk} />;
}
