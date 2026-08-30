"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { tellItBackQuiz } from "@/app/data/quizzes-v2/tell-it-back-quiz";

export default function Page() {
  return <QuizRunner quiz={tellItBackQuiz} />;
}
