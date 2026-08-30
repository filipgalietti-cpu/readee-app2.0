"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g2Unit2Exam } from "@/app/data/quizzes-v2/g2-unit-2-exam";

// GRADE 2 · UNIT 2 EXAM — 13 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g2Unit2Exam} />;
}
