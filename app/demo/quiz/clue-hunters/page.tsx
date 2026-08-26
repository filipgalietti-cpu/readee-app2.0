"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { clueHuntersQuiz } from "@/app/data/quizzes-v2/clue-hunters-quiz";

export default function Page() {
  return <QuizRunner quiz={clueHuntersQuiz} />;
}
