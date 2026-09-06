"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { expertWordsQuiz } from "@/app/data/quizzes-v2/expert-words-quiz";

export default function Page() {
  return <QuizRunner quiz={expertWordsQuiz} />;
}
