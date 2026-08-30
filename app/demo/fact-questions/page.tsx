"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { factQuestions } from "@/app/data/lessons-v2/fact-questions";

// FACTORY-AUTHORED lesson · /demo/fact-questions
export default function Page() {
  return <LessonRunner lesson={factQuestions} />;
}
