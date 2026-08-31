"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { readItOutLoudQuiz } from "@/app/data/quizzes-v2/read-it-out-loud-quiz";

export default function Page() {
  return <QuizRunner quiz={readItOutLoudQuiz} />;
}
