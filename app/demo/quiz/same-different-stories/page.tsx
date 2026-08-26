"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sameDifferentStoriesQuiz } from "@/app/data/quizzes-v2/same-different-stories-quiz";

export default function Page() {
  return <QuizRunner quiz={sameDifferentStoriesQuiz} />;
}
