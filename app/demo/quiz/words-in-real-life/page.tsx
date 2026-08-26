"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordsInRealLifeQuiz } from "@/app/data/quizzes-v2/words-in-real-life-quiz";

export default function Page() {
  return <QuizRunner quiz={wordsInRealLifeQuiz} />;
}
