"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { decodingChampions } from "@/app/data/lessons-v2/decoding-champions";

// FACTORY-AUTHORED lesson · /demo/decoding-champions
export default function Page() {
  return <LessonRunner lesson={decodingChampions} />;
}
