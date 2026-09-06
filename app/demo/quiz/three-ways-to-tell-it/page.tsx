"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { threeWaysToTellItQuiz } from "@/app/data/quizzes-v2/three-ways-to-tell-it-quiz";

export default function Page() {
  return <QuizRunner quiz={threeWaysToTellItQuiz} />;
}
