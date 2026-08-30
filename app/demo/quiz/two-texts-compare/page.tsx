"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { twoTextsCompareQuiz } from "@/app/data/quizzes-v2/two-texts-compare-quiz";

export default function Page() {
  return <QuizRunner quiz={twoTextsCompareQuiz} />;
}
