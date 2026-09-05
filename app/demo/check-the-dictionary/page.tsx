"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { checkTheDictionary } from "@/app/data/lessons-v2/check-the-dictionary";

// FACTORY-AUTHORED lesson · /demo/check-the-dictionary
export default function Page() {
  return <LessonRunner lesson={checkTheDictionary} />;
}
