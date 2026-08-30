"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { bigKidWordsQuiz } from "@/app/data/quizzes-v2/big-kid-words-quiz";

export default function Page() {
  return <QuizRunner quiz={bigKidWordsQuiz} />;
}
