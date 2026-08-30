"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordsInYourWorld } from "@/app/data/lessons-v2/words-in-your-world";

// FACTORY-AUTHORED lesson · /demo/words-in-your-world
export default function Page() {
  return <LessonRunner lesson={wordsInYourWorld} />;
}
