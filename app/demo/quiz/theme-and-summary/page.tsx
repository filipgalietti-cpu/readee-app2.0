"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { themeAndSummaryQuiz } from "@/app/data/quizzes-v2/theme-and-summary-quiz";

export default function Page() {
  return <QuizRunner quiz={themeAndSummaryQuiz} />;
}
