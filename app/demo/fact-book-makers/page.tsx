"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factBookMakers } from "@/app/data/lessons-v2/fact-book-makers";

// FACTORY-AUTHORED lesson · /demo/fact-book-makers
export default function Page() {
  return <LessonRunner lesson={factBookMakers} />;
}
