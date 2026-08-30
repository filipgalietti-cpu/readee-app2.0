"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordSolversQuiz } from "@/app/data/quizzes-v2/word-solvers-quiz";

export default function Page() {
  return <QuizRunner quiz={wordSolversQuiz} />;
}
