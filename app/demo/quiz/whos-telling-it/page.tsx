"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whosTellingItQuiz } from "@/app/data/quizzes-v2/whos-telling-it-quiz";

export default function Page() {
  return <QuizRunner quiz={whosTellingItQuiz} />;
}
