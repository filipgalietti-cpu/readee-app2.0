"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sameAndOppositeQuiz } from "@/app/data/quizzes-v2/same-and-opposite-quiz";

export default function Page() {
  return <QuizRunner quiz={sameAndOppositeQuiz} />;
}
