"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { syllableBeatsQuiz } from "@/app/data/quizzes-v2/syllable-beats-quiz";

export default function Page() {
  return <QuizRunner quiz={syllableBeatsQuiz} />;
}
