"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { soundSpottersQuiz } from "@/app/data/quizzes-v2/sound-spotters-quiz";

export default function Page() {
  return <QuizRunner quiz={soundSpottersQuiz} />;
}
