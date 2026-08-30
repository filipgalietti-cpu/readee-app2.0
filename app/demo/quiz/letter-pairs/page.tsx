"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { letterPairsQuiz } from "@/app/data/quizzes-v2/letter-pairs-quiz";

export default function Page() {
  return <QuizRunner quiz={letterPairsQuiz} />;
}
