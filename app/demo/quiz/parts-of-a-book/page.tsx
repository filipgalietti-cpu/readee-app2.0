"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { partsOfABookQuiz } from "@/app/data/quizzes-v2/parts-of-a-book-quiz";

export default function Page() {
  return <QuizRunner quiz={partsOfABookQuiz} />;
}
