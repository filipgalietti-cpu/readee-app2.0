"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordsOfTheField } from "@/app/data/lessons-v2/words-of-the-field";

// FACTORY-AUTHORED lesson · /demo/words-of-the-field
export default function Page() {
  return <LessonRunner lesson={wordsOfTheField} />;
}
