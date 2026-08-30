"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { authorReasons } from "@/app/data/lessons-v2/author-reasons";

// FACTORY-AUTHORED lesson · /demo/author-reasons
export default function Page() {
  return <LessonRunner lesson={authorReasons} />;
}
