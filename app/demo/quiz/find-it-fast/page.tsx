"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { findItFastQuiz } from "@/app/data/quizzes-v2/find-it-fast-quiz";

export default function Page() {
  return <QuizRunner quiz={findItFastQuiz} />;
}
