"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { authorReasonsQuiz } from "@/app/data/quizzes-v2/author-reasons-quiz";

export default function Page() {
  return <QuizRunner quiz={authorReasonsQuiz} />;
}
