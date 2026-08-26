"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { capitalStartQuiz } from "@/app/data/quizzes-v2/capital-start-quiz";

export default function Page() {
  return <QuizRunner quiz={capitalStartQuiz} />;
}
