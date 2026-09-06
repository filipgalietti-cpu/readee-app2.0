"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { searchLikeAProQuiz } from "@/app/data/quizzes-v2/search-like-a-pro-quiz";

export default function Page() {
  return <QuizRunner quiz={searchLikeAProQuiz} />;
}
