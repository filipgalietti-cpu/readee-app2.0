"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { ruleBreakerWordsQuiz } from "@/app/data/quizzes-v2/rule-breaker-words-quiz";

export default function Page() {
  return <QuizRunner quiz={ruleBreakerWordsQuiz} />;
}
