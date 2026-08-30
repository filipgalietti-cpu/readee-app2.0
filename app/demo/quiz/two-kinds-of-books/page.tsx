"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { twoKindsOfBooksQuiz } from "@/app/data/quizzes-v2/two-kinds-of-books-quiz";

export default function Page() {
  return <QuizRunner quiz={twoKindsOfBooksQuiz} />;
}
