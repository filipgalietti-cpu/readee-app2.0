"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g2Unit1Exam } from "@/app/data/quizzes-v2/g2-unit-1-exam";

// GRADE 2 · UNIT 1 EXAM — 14 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g2Unit1Exam} />;
}
