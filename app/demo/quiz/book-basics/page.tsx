"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { bookBasicsQuiz } from "@/app/data/quizzes-v2/book-basics-quiz";

export default function Page() {
  return <QuizRunner quiz={bookBasicsQuiz} />;
}
