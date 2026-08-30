"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { smoothReaderQuiz } from "@/app/data/quizzes-v2/smooth-reader-quiz";

export default function Page() {
  return <QuizRunner quiz={smoothReaderQuiz} />;
}
