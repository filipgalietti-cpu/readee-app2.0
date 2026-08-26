"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factFinderBasicsQuiz } from "@/app/data/quizzes-v2/fact-finder-basics-quiz";

export default function Page() {
  return <QuizRunner quiz={factFinderBasicsQuiz} />;
}
