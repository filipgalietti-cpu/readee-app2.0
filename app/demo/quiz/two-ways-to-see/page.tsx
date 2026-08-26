"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { twoWaysToSeeQuiz } from "@/app/data/quizzes-v2/two-ways-to-see-quiz";

export default function Page() {
  return <QuizRunner quiz={twoWaysToSeeQuiz} />;
}
