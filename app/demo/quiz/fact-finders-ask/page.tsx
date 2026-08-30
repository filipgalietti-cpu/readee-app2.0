"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factFindersAskQuiz } from "@/app/data/quizzes-v2/fact-finders-ask-quiz";

export default function Page() {
  return <QuizRunner quiz={factFindersAskQuiz} />;
}
