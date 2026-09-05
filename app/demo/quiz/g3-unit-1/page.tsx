"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g3Unit1Exam } from "@/app/data/quizzes-v2/g3-unit-1-exam";

// GRADE 3 · UNIT 1 EXAM — 14 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g3Unit1Exam} />;
}
