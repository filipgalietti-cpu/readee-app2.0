"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { howTheyConnectQuiz } from "@/app/data/quizzes-v2/how-they-connect-quiz";

export default function Page() {
  return <QuizRunner quiz={howTheyConnectQuiz} />;
}
