"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { buildABetterSentenceQuiz } from "@/app/data/quizzes-v2/build-a-better-sentence-quiz";

export default function Page() {
  return <QuizRunner quiz={buildABetterSentenceQuiz} />;
}
