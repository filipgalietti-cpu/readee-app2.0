"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { clickAndClunkQuiz } from "@/app/data/quizzes-v2/click-and-clunk-quiz";

export default function Page() {
  return <QuizRunner quiz={clickAndClunkQuiz} />;
}
