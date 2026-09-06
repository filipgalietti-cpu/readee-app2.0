"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { theAuthorsView } from "@/app/data/lessons-v2/the-authors-view";

// FACTORY-AUTHORED lesson · /demo/the-authors-view
export default function Page() {
  return <LessonRunner lesson={theAuthorsView} />;
}
