"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factsSaySoIKnowQuiz } from "@/app/data/quizzes-v2/facts-say-so-i-know-quiz";

export default function Page() {
  return <QuizRunner quiz={factsSaySoIKnowQuiz} />;
}
