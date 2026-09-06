"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { contextAtADistanceQuiz } from "@/app/data/quizzes-v2/context-at-a-distance-quiz";

export default function Page() {
  return <QuizRunner quiz={contextAtADistanceQuiz} />;
}
