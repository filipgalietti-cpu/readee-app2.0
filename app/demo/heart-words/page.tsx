"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { heartWords } from "@/app/data/lessons-v2/heart-words";

// FACTORY-AUTHORED lesson · /demo/heart-words
export default function Page() {
  return <LessonRunner lesson={heartWords} />;
}
