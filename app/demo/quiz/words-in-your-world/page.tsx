"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordsInYourWorldQuiz } from "@/app/data/quizzes-v2/words-in-your-world-quiz";

export default function Page() {
  return <QuizRunner quiz={wordsInYourWorldQuiz} />;
}
