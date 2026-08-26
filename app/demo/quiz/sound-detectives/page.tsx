"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { soundDetectivesQuiz } from "@/app/data/quizzes-v2/sound-detectives-quiz";

export default function Page() {
  return <QuizRunner quiz={soundDetectivesQuiz} />;
}
