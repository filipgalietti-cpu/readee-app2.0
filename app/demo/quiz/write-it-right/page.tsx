"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { writeItRightQuiz } from "@/app/data/quizzes-v2/write-it-right-quiz";

export default function Page() {
  return <QuizRunner quiz={writeItRightQuiz} />;
}
