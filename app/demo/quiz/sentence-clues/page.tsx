"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sentenceCluesQuiz } from "@/app/data/quizzes-v2/sentence-clues-quiz";

export default function Page() {
  return <QuizRunner quiz={sentenceCluesQuiz} />;
}
