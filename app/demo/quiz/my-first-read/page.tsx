"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { myFirstReadQuiz } from "@/app/data/quizzes-v2/my-first-read-quiz";

export default function Page() {
  return <QuizRunner quiz={myFirstReadQuiz} />;
}
