"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { unit2Exam } from "@/app/data/quizzes-v2/unit-2-exam";

// UNIT 2 EXAM — 12 hand-chosen questions, fixed order, adaptive off.
export default function Page() {
  return <QuizRunner quiz={unit2Exam} />;
}
