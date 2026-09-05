"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whenAndWhereWords } from "@/app/data/lessons-v2/when-and-where-words";

// FACTORY-AUTHORED lesson · /demo/when-and-where-words
export default function Page() {
  return <LessonRunner lesson={whenAndWhereWords} />;
}
