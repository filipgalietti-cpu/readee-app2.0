"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { longVowelBuilders } from "@/app/data/lessons-v2/long-vowel-builders";

// FACTORY-AUTHORED lesson · /demo/long-vowel-builders
export default function Page() {
  return <LessonRunner lesson={longVowelBuilders} />;
}
