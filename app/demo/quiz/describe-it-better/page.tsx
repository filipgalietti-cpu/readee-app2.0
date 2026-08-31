"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { describeItBetterQuiz } from "@/app/data/quizzes-v2/describe-it-better-quiz";

export default function Page() {
  return <QuizRunner quiz={describeItBetterQuiz} />;
}
