"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { theWholeChapter } from "@/app/data/lessons-v2/the-whole-chapter";

// FACTORY-AUTHORED lesson · /demo/the-whole-chapter
export default function Page() {
  return <LessonRunner lesson={theWholeChapter} />;
}
