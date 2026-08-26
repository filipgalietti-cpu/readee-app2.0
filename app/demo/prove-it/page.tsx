"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { proveIt } from "@/app/data/lessons-v2/prove-it";

// FACTORY-AUTHORED lesson · /demo/prove-it
export default function Page() {
  return <LessonRunner lesson={proveIt} />;
}
