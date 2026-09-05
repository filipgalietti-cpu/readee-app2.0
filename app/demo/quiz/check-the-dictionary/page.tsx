"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { checkTheDictionaryQuiz } from "@/app/data/quizzes-v2/check-the-dictionary-quiz";

export default function Page() {
  return <QuizRunner quiz={checkTheDictionaryQuiz} />;
}
