"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g2Unit3Exam } from "@/app/data/quizzes-v2/g2-unit-3-exam";

// GRADE 2 · UNIT 3 EXAM — 15 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g2Unit3Exam} />;
}
