"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { holdItUpQuiz } from "@/app/data/quizzes-v2/hold-it-up-quiz";

export default function Page() {
  return <QuizRunner quiz={holdItUpQuiz} />;
}
