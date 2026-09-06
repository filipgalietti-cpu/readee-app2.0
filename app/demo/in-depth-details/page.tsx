"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { inDepthDetails } from "@/app/data/lessons-v2/in-depth-details";

// FACTORY-AUTHORED lesson · /demo/in-depth-details
export default function Page() {
  return <LessonRunner lesson={inDepthDetails} />;
}
