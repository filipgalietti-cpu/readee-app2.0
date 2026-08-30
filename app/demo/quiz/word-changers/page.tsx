"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordChangersQuiz } from "@/app/data/quizzes-v2/word-changers-quiz";

export default function Page() {
  return <QuizRunner quiz={wordChangersQuiz} />;
}
