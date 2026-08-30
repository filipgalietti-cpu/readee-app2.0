"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { pictureDetectivesQuiz } from "@/app/data/quizzes-v2/picture-detectives-quiz";

export default function Page() {
  return <QuizRunner quiz={pictureDetectivesQuiz} />;
}
