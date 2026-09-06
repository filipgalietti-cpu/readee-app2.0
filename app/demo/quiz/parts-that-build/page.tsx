"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { partsThatBuildQuiz } from "@/app/data/quizzes-v2/parts-that-build-quiz";

export default function Page() {
  return <QuizRunner quiz={partsThatBuildQuiz} />;
}
