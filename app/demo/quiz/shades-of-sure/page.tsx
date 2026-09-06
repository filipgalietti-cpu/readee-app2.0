"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { shadesOfSureQuiz } from "@/app/data/quizzes-v2/shades-of-sure-quiz";

export default function Page() {
  return <QuizRunner quiz={shadesOfSureQuiz} />;
}
