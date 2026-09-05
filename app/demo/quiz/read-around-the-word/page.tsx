"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { readAroundTheWordQuiz } from "@/app/data/quizzes-v2/read-around-the-word-quiz";

export default function Page() {
  return <QuizRunner quiz={readAroundTheWordQuiz} />;
}
