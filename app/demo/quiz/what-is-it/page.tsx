"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whatIsItQuiz } from "@/app/data/quizzes-v2/what-is-it-quiz";

export default function Page() {
  return <QuizRunner quiz={whatIsItQuiz} />;
}
