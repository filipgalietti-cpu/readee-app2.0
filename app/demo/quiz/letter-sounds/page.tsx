"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { letterSoundsQuiz } from "@/app/data/quizzes-v2/letter-sounds-quiz";

export default function Page() {
  return <QuizRunner quiz={letterSoundsQuiz} />;
}
