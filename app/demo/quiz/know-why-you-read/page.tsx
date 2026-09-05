"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { knowWhyYouReadQuiz } from "@/app/data/quizzes-v2/know-why-you-read-quiz";

export default function Page() {
  return <QuizRunner quiz={knowWhyYouReadQuiz} />;
}
