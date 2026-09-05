"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { pointToTheFactQuiz } from "@/app/data/quizzes-v2/point-to-the-fact-quiz";

export default function Page() {
  return <QuizRunner quiz={pointToTheFactQuiz} />;
}
