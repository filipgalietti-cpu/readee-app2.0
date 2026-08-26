"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { proveItQuiz } from "@/app/data/quizzes-v2/prove-it-quiz";

export default function Page() {
  return <QuizRunner quiz={proveItQuiz} />;
}
