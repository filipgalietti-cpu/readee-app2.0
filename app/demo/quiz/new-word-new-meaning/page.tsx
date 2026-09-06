"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { newWordNewMeaningQuiz } from "@/app/data/quizzes-v2/new-word-new-meaning-quiz";

export default function Page() {
  return <QuizRunner quiz={newWordNewMeaningQuiz} />;
}
