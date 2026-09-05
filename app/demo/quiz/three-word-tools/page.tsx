"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { threeWordToolsQuiz } from "@/app/data/quizzes-v2/three-word-tools-quiz";

export default function Page() {
  return <QuizRunner quiz={threeWordToolsQuiz} />;
}
