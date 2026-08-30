"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g1Unit2Exam } from "@/app/data/quizzes-v2/g1-unit-2-exam";

// GRADE 1 · UNIT 2 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g1Unit2Exam} />;
}
