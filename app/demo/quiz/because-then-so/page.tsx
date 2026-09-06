"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { becauseThenSoQuiz } from "@/app/data/quizzes-v2/because-then-so-quiz";

export default function Page() {
  return <QuizRunner quiz={becauseThenSoQuiz} />;
}
