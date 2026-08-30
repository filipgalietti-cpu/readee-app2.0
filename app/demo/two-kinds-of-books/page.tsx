"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { twoKindsOfBooks } from "@/app/data/lessons-v2/two-kinds-of-books";

// FACTORY-AUTHORED lesson · /demo/two-kinds-of-books
export default function Page() {
  return <LessonRunner lesson={twoKindsOfBooks} />;
}
