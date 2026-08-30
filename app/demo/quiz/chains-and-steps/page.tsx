"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { chainsAndStepsQuiz } from "@/app/data/quizzes-v2/chains-and-steps-quiz";

export default function Page() {
  return <QuizRunner quiz={chainsAndStepsQuiz} />;
}
