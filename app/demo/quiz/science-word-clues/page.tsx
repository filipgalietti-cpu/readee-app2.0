"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { scienceWordCluesQuiz } from "@/app/data/quizzes-v2/science-word-clues-quiz";

export default function Page() {
  return <QuizRunner quiz={scienceWordCluesQuiz} />;
}
