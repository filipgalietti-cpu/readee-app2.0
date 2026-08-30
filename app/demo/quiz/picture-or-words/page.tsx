"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { pictureOrWordsQuiz } from "@/app/data/quizzes-v2/picture-or-words-quiz";

export default function Page() {
  return <QuizRunner quiz={pictureOrWordsQuiz} />;
}
