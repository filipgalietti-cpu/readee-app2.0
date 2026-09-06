"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { theirViewYourViewQuiz } from "@/app/data/quizzes-v2/their-view-your-view-quiz";

export default function Page() {
  return <QuizRunner quiz={theirViewYourViewQuiz} />;
}
