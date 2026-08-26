"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { digraphDetectivesQuiz } from "@/app/data/quizzes-v2/digraph-detectives-quiz";

export default function Page() {
  return <QuizRunner quiz={digraphDetectivesQuiz} />;
}
