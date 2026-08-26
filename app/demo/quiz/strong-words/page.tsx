"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { strongWordsQuiz } from "@/app/data/quizzes-v2/strong-words-quiz";

export default function Page() {
  return <QuizRunner quiz={strongWordsQuiz} />;
}
