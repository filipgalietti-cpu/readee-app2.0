"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factLinksQuiz } from "@/app/data/quizzes-v2/fact-links-quiz";

export default function Page() {
  return <QuizRunner quiz={factLinksQuiz} />;
}
