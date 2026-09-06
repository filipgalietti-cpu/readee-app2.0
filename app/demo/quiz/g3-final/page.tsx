"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g3Final } from "@/app/data/quizzes-v2/g3-final";

// GRADE 3 GRADUATION EXAM — 18 hand-chosen questions spanning all four units, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g3Final} />;
}
