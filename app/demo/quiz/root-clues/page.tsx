"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { rootCluesQuiz } from "@/app/data/quizzes-v2/root-clues-quiz";

export default function Page() {
  return <QuizRunner quiz={rootCluesQuiz} />;
}
