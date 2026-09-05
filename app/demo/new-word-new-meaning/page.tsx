"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { newWordNewMeaning } from "@/app/data/lessons-v2/new-word-new-meaning";

// FACTORY-AUTHORED lesson · /demo/new-word-new-meaning
export default function Page() {
  return <LessonRunner lesson={newWordNewMeaning} />;
}
