"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { longOrShortQuiz } from "@/app/data/quizzes-v2/long-or-short-quiz";

export default function Page() {
  return <QuizRunner quiz={longOrShortQuiz} />;
}
