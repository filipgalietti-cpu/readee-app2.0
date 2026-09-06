"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { buildABetterSentence } from "@/app/data/lessons-v2/build-a-better-sentence";

// FACTORY-AUTHORED lesson · /demo/build-a-better-sentence
export default function Page() {
  return <LessonRunner lesson={buildABetterSentence} />;
}
