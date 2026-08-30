"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordMachinesQuiz } from "@/app/data/quizzes-v2/word-machines-quiz";

export default function Page() {
  return <QuizRunner quiz={wordMachinesQuiz} />;
}
