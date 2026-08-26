"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { soundSlidersQuiz } from "@/app/data/quizzes-v2/sound-sliders-quiz";

export default function Page() {
  return <QuizRunner quiz={soundSlidersQuiz} />;
}
