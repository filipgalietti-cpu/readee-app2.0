"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { longWordsFullSpeedQuiz } from "@/app/data/quizzes-v2/long-words-full-speed-quiz";

export default function Page() {
  return <QuizRunner quiz={longWordsFullSpeedQuiz} />;
}
