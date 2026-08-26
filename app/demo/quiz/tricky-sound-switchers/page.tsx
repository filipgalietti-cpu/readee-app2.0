"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { trickySoundSwitchersQuiz } from "@/app/data/quizzes-v2/tricky-sound-switchers-quiz";

export default function Page() {
  return <QuizRunner quiz={trickySoundSwitchersQuiz} />;
}
