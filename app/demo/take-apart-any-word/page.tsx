"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { takeApartAnyWord } from "@/app/data/lessons-v2/take-apart-any-word";

// FACTORY-AUTHORED lesson · /demo/take-apart-any-word
export default function Page() {
  return <LessonRunner lesson={takeApartAnyWord} />;
}
