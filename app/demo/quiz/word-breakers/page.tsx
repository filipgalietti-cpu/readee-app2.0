"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordBreakersQuiz } from "@/app/data/quizzes-v2/word-breakers-quiz";

export default function Page() {
  return <QuizRunner quiz={wordBreakersQuiz} />;
}
