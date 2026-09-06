"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { commasQuotesCapitalsQuiz } from "@/app/data/quizzes-v2/commas-quotes-capitals-quiz";

export default function Page() {
  return <QuizRunner quiz={commasQuotesCapitalsQuiz} />;
}
