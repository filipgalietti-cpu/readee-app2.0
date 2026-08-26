"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { categoryCaptainQuiz } from "@/app/data/quizzes-v2/category-captain-quiz";

export default function Page() {
  return <QuizRunner quiz={categoryCaptainQuiz} />;
}
