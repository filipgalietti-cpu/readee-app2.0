"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g1Final } from "@/app/data/quizzes-v2/g1-final";

// GRADE 1 GRADUATION EXAM — 16 questions, all five units, fixed order.
export default function Page() {
  return <QuizRunner quiz={g1Final} />;
}
