"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { scienceWordWonderQuiz } from "@/app/data/quizzes-v2/science-word-wonder-quiz";

export default function Page() {
  return <QuizRunner quiz={scienceWordWonderQuiz} />;
}
