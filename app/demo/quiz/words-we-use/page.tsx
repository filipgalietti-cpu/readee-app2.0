"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordsWeUseQuiz } from "@/app/data/quizzes-v2/words-we-use-quiz";

export default function Page() {
  return <QuizRunner quiz={wordsWeUseQuiz} />;
}
