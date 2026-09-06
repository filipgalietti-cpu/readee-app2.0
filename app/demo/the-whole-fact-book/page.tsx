"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { theWholeFactBook } from "@/app/data/lessons-v2/the-whole-fact-book";

// FACTORY-AUTHORED lesson · /demo/the-whole-fact-book
export default function Page() {
  return <LessonRunner lesson={theWholeFactBook} />;
}
