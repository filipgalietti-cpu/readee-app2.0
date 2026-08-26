"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordSolvers } from "@/app/data/lessons-v2/word-solvers";

// FACTORY-AUTHORED lesson · /demo/word-solvers
export default function Page() {
  return <LessonRunner lesson={wordSolvers} />;
}
