"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { letterPerfectQuiz } from "@/app/data/quizzes-v2/letter-perfect-quiz";

export default function Page() {
  return <QuizRunner quiz={letterPerfectQuiz} />;
}
