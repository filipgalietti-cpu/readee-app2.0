"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { picturesTellMoreQuiz } from "@/app/data/quizzes-v2/pictures-tell-more-quiz";

export default function Page() {
  return <QuizRunner quiz={picturesTellMoreQuiz} />;
}
