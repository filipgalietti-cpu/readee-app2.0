"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { endingReadersQuiz } from "@/app/data/quizzes-v2/ending-readers-quiz";

export default function Page() {
  return <QuizRunner quiz={endingReadersQuiz} />;
}
