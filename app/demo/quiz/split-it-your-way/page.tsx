"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { splitItYourWayQuiz } from "@/app/data/quizzes-v2/split-it-your-way-quiz";

export default function Page() {
  return <QuizRunner quiz={splitItYourWayQuiz} />;
}
