"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { justRightWordsQuiz } from "@/app/data/quizzes-v2/just-right-words-quiz";

export default function Page() {
  return <QuizRunner quiz={justRightWordsQuiz} />;
}
