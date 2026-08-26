"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { unit3Exam } from "@/app/data/quizzes-v2/unit-3-exam";

// UNIT 3 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={unit3Exam} />;
}
