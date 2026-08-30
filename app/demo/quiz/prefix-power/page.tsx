"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { prefixPowerQuiz } from "@/app/data/quizzes-v2/prefix-power-quiz";

export default function Page() {
  return <QuizRunner quiz={prefixPowerQuiz} />;
}
