"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factReadingPartyQuiz } from "@/app/data/quizzes-v2/fact-reading-party-quiz";

export default function Page() {
  return <QuizRunner quiz={factReadingPartyQuiz} />;
}
