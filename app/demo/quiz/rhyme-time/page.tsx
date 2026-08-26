"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { rhymeTimeQuiz } from "@/app/data/quizzes-v2/rhyme-time-quiz";

// Rory's quiz — the post-lesson quiz beats: countdown → bunny dance → streak
// flame → perfect score → performance review, with the adaptive ladder.
export default function Page() {
  return <QuizRunner quiz={rhymeTimeQuiz} />;
}
