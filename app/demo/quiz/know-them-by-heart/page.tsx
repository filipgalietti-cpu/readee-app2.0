"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { knowThemByHeartQuiz } from "@/app/data/quizzes-v2/know-them-by-heart-quiz";

export default function Page() {
  return <QuizRunner quiz={knowThemByHeartQuiz} />;
}
