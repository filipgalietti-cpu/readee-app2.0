"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { smoothReader } from "@/app/data/lessons-v2/smooth-reader";

// FACTORY-AUTHORED lesson · /demo/smooth-reader
export default function Page() {
  return <LessonRunner lesson={smoothReader} />;
}
