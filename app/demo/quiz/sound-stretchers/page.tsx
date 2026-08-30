"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { soundStretchersQuiz } from "@/app/data/quizzes-v2/sound-stretchers-quiz";

export default function Page() {
  return <QuizRunner quiz={soundStretchersQuiz} />;
}
