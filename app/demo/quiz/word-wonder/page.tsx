"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordWonderQuiz } from "@/app/data/quizzes-v2/word-wonder-quiz";

export default function Page() {
  return <QuizRunner quiz={wordWonderQuiz} />;
}
