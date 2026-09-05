"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { followTheMessageQuiz } from "@/app/data/quizzes-v2/follow-the-message-quiz";

export default function Page() {
  return <QuizRunner quiz={followTheMessageQuiz} />;
}
