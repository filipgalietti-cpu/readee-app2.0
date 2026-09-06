"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { mainIdeaAndSummaryQuiz } from "@/app/data/quizzes-v2/main-idea-and-summary-quiz";

export default function Page() {
  return <QuizRunner quiz={mainIdeaAndSummaryQuiz} />;
}
