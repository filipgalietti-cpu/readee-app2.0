"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { bookMakersQuiz } from "@/app/data/quizzes-v2/book-makers-quiz";

export default function Page() {
  return <QuizRunner quiz={bookMakersQuiz} />;
}
