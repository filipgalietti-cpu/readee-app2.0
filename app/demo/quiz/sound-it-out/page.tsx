"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { soundItOutQuiz } from "@/app/data/quizzes-v2/sound-it-out-quiz";

export default function Page() {
  return <QuizRunner quiz={soundItOutQuiz} />;
}
