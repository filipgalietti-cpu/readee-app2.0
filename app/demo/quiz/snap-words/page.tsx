"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { snapWordsQuiz } from "@/app/data/quizzes-v2/snap-words-quiz";

export default function Page() {
  return <QuizRunner quiz={snapWordsQuiz} />;
}
