"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordPlusWordQuiz } from "@/app/data/quizzes-v2/word-plus-word-quiz";

export default function Page() {
  return <QuizRunner quiz={wordPlusWordQuiz} />;
}
