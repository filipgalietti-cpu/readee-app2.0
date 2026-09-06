"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { chunkByChunk } from "@/app/data/lessons-v2/chunk-by-chunk";

// FACTORY-AUTHORED lesson · /demo/chunk-by-chunk
export default function Page() {
  return <LessonRunner lesson={chunkByChunk} />;
}
