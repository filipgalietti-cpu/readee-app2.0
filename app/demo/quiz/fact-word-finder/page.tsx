"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factWordFinderQuiz } from "@/app/data/quizzes-v2/fact-word-finder-quiz";

export default function Page() {
  return <QuizRunner quiz={factWordFinderQuiz} />;
}
