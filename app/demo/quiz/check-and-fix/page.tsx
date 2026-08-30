"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { checkAndFixQuiz } from "@/app/data/quizzes-v2/check-and-fix-quiz";

export default function Page() {
  return <QuizRunner quiz={checkAndFixQuiz} />;
}
