"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sayingsThatMeanMoreQuiz } from "@/app/data/quizzes-v2/sayings-that-mean-more-quiz";

export default function Page() {
  return <QuizRunner quiz={sayingsThatMeanMoreQuiz} />;
}
