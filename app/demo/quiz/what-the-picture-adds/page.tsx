"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whatThePictureAddsQuiz } from "@/app/data/quizzes-v2/what-the-picture-adds-quiz";

export default function Page() {
  return <QuizRunner quiz={whatThePictureAddsQuiz} />;
}
