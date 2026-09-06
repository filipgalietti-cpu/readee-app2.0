"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g3Unit3Exam } from "@/app/data/quizzes-v2/g3-unit-3-exam";

// GRADE 3 · UNIT 3 EXAM — 14 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g3Unit3Exam} />;
}
