"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { inDepthDetailsQuiz } from "@/app/data/quizzes-v2/in-depth-details-quiz";

export default function Page() {
  return <QuizRunner quiz={inDepthDetailsQuiz} />;
}
