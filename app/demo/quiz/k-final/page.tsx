"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { kFinal } from "@/app/data/quizzes-v2/k-final";

// KINDERGARTEN GRADUATION EXAM — 16 questions, all four units, fixed order.
export default function Page() {
  return <QuizRunner quiz={kFinal} />;
}
