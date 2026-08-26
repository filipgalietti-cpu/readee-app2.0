"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { keyDetails } from "@/app/data/lessons-v2/key-details";

// FACTORY-AUTHORED lesson · /demo/key-details
export default function Page() {
  return <LessonRunner lesson={keyDetails} />;
}
