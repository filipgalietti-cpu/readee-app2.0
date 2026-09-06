"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { theRightToolQuiz } from "@/app/data/quizzes-v2/the-right-tool-quiz";

export default function Page() {
  return <QuizRunner quiz={theRightToolQuiz} />;
}
