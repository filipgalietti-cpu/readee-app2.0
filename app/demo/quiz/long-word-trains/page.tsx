"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { longWordTrainsQuiz } from "@/app/data/quizzes-v2/long-word-trains-quiz";

export default function Page() {
  return <QuizRunner quiz={longWordTrainsQuiz} />;
}
