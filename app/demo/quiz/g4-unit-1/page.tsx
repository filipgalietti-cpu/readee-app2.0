"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g4Unit1Exam } from "@/app/data/quizzes-v2/g4-unit-1-exam";

// GRADE 4 · UNIT 1 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g4Unit1Exam} />;
}
