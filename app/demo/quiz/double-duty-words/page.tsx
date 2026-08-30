"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { doubleDutyWordsQuiz } from "@/app/data/quizzes-v2/double-duty-words-quiz";

export default function Page() {
  return <QuizRunner quiz={doubleDutyWordsQuiz} />;
}
