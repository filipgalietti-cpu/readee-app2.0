"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { partsOfABook } from "@/app/data/lessons-v2/parts-of-a-book";

// FACTORY-AUTHORED lesson · /demo/parts-of-a-book
export default function Page() {
  return <LessonRunner lesson={partsOfABook} />;
}
