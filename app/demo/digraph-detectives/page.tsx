"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { digraphDetectives } from "@/app/data/lessons-v2/digraph-detectives";

// FACTORY-AUTHORED lesson · /demo/digraph-detectives
export default function Page() {
  return <LessonRunner lesson={digraphDetectives} />;
}
