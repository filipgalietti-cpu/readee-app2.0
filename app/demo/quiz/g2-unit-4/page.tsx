"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g2Unit4Exam } from "@/app/data/quizzes-v2/g2-unit-4-exam";

// GRADE 2 · UNIT 4 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g2Unit4Exam} />;
}
