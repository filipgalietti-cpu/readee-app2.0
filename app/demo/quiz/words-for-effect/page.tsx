"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordsForEffectQuiz } from "@/app/data/quizzes-v2/words-for-effect-quiz";

export default function Page() {
  return <QuizRunner quiz={wordsForEffectQuiz} />;
}
