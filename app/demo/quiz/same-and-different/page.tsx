"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sameAndDifferentQuiz } from "@/app/data/quizzes-v2/same-and-different-quiz";

export default function Page() {
  return <QuizRunner quiz={sameAndDifferentQuiz} />;
}
