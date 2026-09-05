"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { takeApartAnyWordQuiz } from "@/app/data/quizzes-v2/take-apart-any-word-quiz";

export default function Page() {
  return <QuizRunner quiz={takeApartAnyWordQuiz} />;
}
