"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { picturesThatTeachQuiz } from "@/app/data/quizzes-v2/pictures-that-teach-quiz";

export default function Page() {
  return <QuizRunner quiz={picturesThatTeachQuiz} />;
}
