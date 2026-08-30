"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { askItFindItQuiz } from "@/app/data/quizzes-v2/ask-it-find-it-quiz";

export default function Page() {
  return <QuizRunner quiz={askItFindItQuiz} />;
}
