"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { grammarBuildersQuiz } from "@/app/data/quizzes-v2/grammar-builders-quiz";

export default function Page() {
  return <QuizRunner quiz={grammarBuildersQuiz} />;
}
