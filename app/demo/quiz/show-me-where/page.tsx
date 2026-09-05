"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { showMeWhereQuiz } from "@/app/data/quizzes-v2/show-me-where-quiz";

export default function Page() {
  return <QuizRunner quiz={showMeWhereQuiz} />;
}
