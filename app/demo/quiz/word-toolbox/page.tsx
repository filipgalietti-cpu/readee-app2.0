"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordToolboxQuiz } from "@/app/data/quizzes-v2/word-toolbox-quiz";

export default function Page() {
  return <QuizRunner quiz={wordToolboxQuiz} />;
}
