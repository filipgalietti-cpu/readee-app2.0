"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { askItFindIt } from "@/app/data/lessons-v2/ask-it-find-it";

// FACTORY-AUTHORED lesson · /demo/ask-it-find-it
export default function Page() {
  return <LessonRunner lesson={askItFindIt} />;
}
