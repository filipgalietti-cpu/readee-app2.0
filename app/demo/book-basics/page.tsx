"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { bookBasics } from "@/app/data/lessons-v2/book-basics";

// FACTORY-AUTHORED lesson · /demo/book-basics
export default function Page() {
  return <LessonRunner lesson={bookBasics} />;
}
