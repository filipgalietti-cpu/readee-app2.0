"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { moreThanItSaysQuiz } from "@/app/data/quizzes-v2/more-than-it-says-quiz";

export default function Page() {
  return <QuizRunner quiz={moreThanItSaysQuiz} />;
}
