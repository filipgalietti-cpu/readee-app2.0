"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { fableTellersQuiz } from "@/app/data/quizzes-v2/fable-tellers-quiz";

export default function Page() {
  return <QuizRunner quiz={fableTellersQuiz} />;
}
