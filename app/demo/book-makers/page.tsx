"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { bookMakers } from "@/app/data/lessons-v2/book-makers";

// FACTORY-AUTHORED lesson · /demo/book-makers
export default function Page() {
  return <LessonRunner lesson={bookMakers} />;
}
