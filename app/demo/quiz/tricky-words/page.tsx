"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { trickyWordsQuiz } from "@/app/data/quizzes-v2/tricky-words-quiz";

export default function Page() {
  return <QuizRunner quiz={trickyWordsQuiz} />;
}
