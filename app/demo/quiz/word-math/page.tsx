"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordMathQuiz } from "@/app/data/quizzes-v2/word-math-quiz";

export default function Page() {
  return <QuizRunner quiz={wordMathQuiz} />;
}
