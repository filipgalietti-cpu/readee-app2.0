"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { textFeatureFindersQuiz } from "@/app/data/quizzes-v2/text-feature-finders-quiz";

export default function Page() {
  return <QuizRunner quiz={textFeatureFindersQuiz} />;
}
