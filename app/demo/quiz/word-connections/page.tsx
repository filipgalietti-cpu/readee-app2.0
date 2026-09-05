"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordConnectionsQuiz } from "@/app/data/quizzes-v2/word-connections-quiz";

export default function Page() {
  return <QuizRunner quiz={wordConnectionsQuiz} />;
}
