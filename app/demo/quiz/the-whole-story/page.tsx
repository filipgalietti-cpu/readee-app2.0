"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { theWholeStoryQuiz } from "@/app/data/quizzes-v2/the-whole-story-quiz";

export default function Page() {
  return <QuizRunner quiz={theWholeStoryQuiz} />;
}
