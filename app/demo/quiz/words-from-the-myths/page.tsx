"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordsFromTheMythsQuiz } from "@/app/data/quizzes-v2/words-from-the-myths-quiz";

export default function Page() {
  return <QuizRunner quiz={wordsFromTheMythsQuiz} />;
}
