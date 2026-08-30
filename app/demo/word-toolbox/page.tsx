"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordToolbox } from "@/app/data/lessons-v2/word-toolbox";

// FACTORY-AUTHORED lesson · /demo/word-toolbox
export default function Page() {
  return <LessonRunner lesson={wordToolbox} />;
}
