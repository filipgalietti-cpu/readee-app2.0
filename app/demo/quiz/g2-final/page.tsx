"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g2Final } from "@/app/data/quizzes-v2/g2-final";

// GRADE 2 GRADUATION EXAM — 18 questions, all four units, fixed order.
export default function Page() {
  return <QuizRunner quiz={g2Final} />;
}
