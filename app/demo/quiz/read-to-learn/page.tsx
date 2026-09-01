"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { readToLearnQuiz } from "@/app/data/quizzes-v2/read-to-learn-quiz";

export default function Page() {
  return <QuizRunner quiz={readToLearnQuiz} />;
}
