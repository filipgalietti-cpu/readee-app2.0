"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { readWithYourBrainQuiz } from "@/app/data/quizzes-v2/read-with-your-brain-quiz";

export default function Page() {
  return <QuizRunner quiz={readWithYourBrainQuiz} />;
}
