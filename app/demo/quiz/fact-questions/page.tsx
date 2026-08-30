"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factQuestionsQuiz } from "@/app/data/quizzes-v2/fact-questions-quiz";

export default function Page() {
  return <QuizRunner quiz={factQuestionsQuiz} />;
}
