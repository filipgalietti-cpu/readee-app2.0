"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { lookCloseQuiz } from "@/app/data/quizzes-v2/look-close-quiz";

export default function Page() {
  return <QuizRunner quiz={lookCloseQuiz} />;
}
