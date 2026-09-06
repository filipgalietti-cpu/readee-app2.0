"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { g3Unit4Exam } from "@/app/data/quizzes-v2/g3-unit-4-exam";

// GRADE 3 · UNIT 4 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={g3Unit4Exam} />;
}
