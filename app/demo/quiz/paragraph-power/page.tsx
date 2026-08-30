"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { paragraphPowerQuiz } from "@/app/data/quizzes-v2/paragraph-power-quiz";

export default function Page() {
  return <QuizRunner quiz={paragraphPowerQuiz} />;
}
