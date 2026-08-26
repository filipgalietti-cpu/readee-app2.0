"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { readingWithPurposeQuiz } from "@/app/data/quizzes-v2/reading-with-purpose-quiz";

export default function Page() {
  return <QuizRunner quiz={readingWithPurposeQuiz} />;
}
