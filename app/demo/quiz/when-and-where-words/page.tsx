"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whenAndWhereWordsQuiz } from "@/app/data/quizzes-v2/when-and-where-words-quiz";

export default function Page() {
  return <QuizRunner quiz={whenAndWhereWordsQuiz} />;
}
