"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { theShapeOfTheFactsQuiz } from "@/app/data/quizzes-v2/the-shape-of-the-facts-quiz";

export default function Page() {
  return <QuizRunner quiz={theShapeOfTheFactsQuiz} />;
}
