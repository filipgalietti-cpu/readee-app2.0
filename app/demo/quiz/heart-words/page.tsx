"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { heartWordsQuiz } from "@/app/data/quizzes-v2/heart-words-quiz";

export default function Page() {
  return <QuizRunner quiz={heartWordsQuiz} />;
}
