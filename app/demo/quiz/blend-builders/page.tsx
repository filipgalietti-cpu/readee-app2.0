"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { blendBuildersQuiz } from "@/app/data/quizzes-v2/blend-builders-quiz";

export default function Page() {
  return <QuizRunner quiz={blendBuildersQuiz} />;
}
