"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordMachines } from "@/app/data/lessons-v2/word-machines";

// FACTORY-AUTHORED lesson · /demo/word-machines
export default function Page() {
  return <LessonRunner lesson={wordMachines} />;
}
