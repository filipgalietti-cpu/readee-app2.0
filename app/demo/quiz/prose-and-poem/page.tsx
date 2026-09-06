"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { proseAndPoemQuiz } from "@/app/data/quizzes-v2/prose-and-poem-quiz";

export default function Page() {
  return <QuizRunner quiz={proseAndPoemQuiz} />;
}
