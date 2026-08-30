"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { askAndAnswerG2Quiz } from "@/app/data/quizzes-v2/ask-and-answer-g2-quiz";

export default function Page() {
  return <QuizRunner quiz={askAndAnswerG2Quiz} />;
}
