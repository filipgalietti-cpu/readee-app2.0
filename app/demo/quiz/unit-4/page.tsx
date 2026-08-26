"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { unit4Exam } from "@/app/data/quizzes-v2/unit-4-exam";

// UNIT 4 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={unit4Exam} />;
}
