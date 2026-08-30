"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { keyDetailsQuiz } from "@/app/data/quizzes-v2/key-details-quiz";

export default function Page() {
  return <QuizRunner quiz={keyDetailsQuiz} />;
}
