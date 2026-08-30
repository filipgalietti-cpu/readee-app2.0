"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { bigKidWords } from "@/app/data/lessons-v2/big-kid-words";

// FACTORY-AUTHORED lesson · /demo/big-kid-words
export default function Page() {
  return <LessonRunner lesson={bigKidWords} />;
}
