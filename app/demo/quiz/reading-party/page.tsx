"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { readingPartyQuiz } from "@/app/data/quizzes-v2/reading-party-quiz";

export default function Page() {
  return <QuizRunner quiz={readingPartyQuiz} />;
}
