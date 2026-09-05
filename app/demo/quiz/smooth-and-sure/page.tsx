"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { smoothAndSureQuiz } from "@/app/data/quizzes-v2/smooth-and-sure-quiz";

export default function Page() {
  return <QuizRunner quiz={smoothAndSureQuiz} />;
}
