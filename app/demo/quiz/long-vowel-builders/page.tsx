"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { longVowelBuildersQuiz } from "@/app/data/quizzes-v2/long-vowel-builders-quiz";

export default function Page() {
  return <QuizRunner quiz={longVowelBuildersQuiz} />;
}
