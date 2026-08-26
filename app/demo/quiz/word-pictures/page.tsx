"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordPicturesQuiz } from "@/app/data/quizzes-v2/word-pictures-quiz";

export default function Page() {
  return <QuizRunner quiz={wordPicturesQuiz} />;
}
