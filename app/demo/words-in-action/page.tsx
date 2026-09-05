"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordsInAction } from "@/app/data/lessons-v2/words-in-action";

// FACTORY-AUTHORED lesson · /demo/words-in-action
export default function Page() {
  return <LessonRunner lesson={wordsInAction} />;
}
