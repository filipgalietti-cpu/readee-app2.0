"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { theWholeFactBookQuiz } from "@/app/data/quizzes-v2/the-whole-fact-book-quiz";

export default function Page() {
  return <QuizRunner quiz={theWholeFactBookQuiz} />;
}
