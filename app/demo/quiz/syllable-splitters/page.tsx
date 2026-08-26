"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { syllableSplittersQuiz } from "@/app/data/quizzes-v2/syllable-splitters-quiz";

export default function Page() {
  return <QuizRunner quiz={syllableSplittersQuiz} />;
}
