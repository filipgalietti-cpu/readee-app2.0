"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { lookItUpQuiz } from "@/app/data/quizzes-v2/look-it-up-quiz";

export default function Page() {
  return <QuizRunner quiz={lookItUpQuiz} />;
}
