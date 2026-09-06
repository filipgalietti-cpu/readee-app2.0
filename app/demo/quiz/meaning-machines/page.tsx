"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { meaningMachinesQuiz } from "@/app/data/quizzes-v2/meaning-machines-quiz";

export default function Page() {
  return <QuizRunner quiz={meaningMachinesQuiz} />;
}
