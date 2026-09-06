"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { bigIdeaBackedUpQuiz } from "@/app/data/quizzes-v2/big-idea-backed-up-quiz";

export default function Page() {
  return <QuizRunner quiz={bigIdeaBackedUpQuiz} />;
}
