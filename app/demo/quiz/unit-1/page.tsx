"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { unit1Exam } from "@/app/data/quizzes-v2/unit-1-exam";

// UNIT 1 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={unit1Exam} />;
}
