"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { pictureCluesQuiz } from "@/app/data/quizzes-v2/picture-clues-quiz";

export default function Page() {
  return <QuizRunner quiz={pictureCluesQuiz} />;
}
