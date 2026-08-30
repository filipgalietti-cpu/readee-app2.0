"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { oneStoryTwoWaysQuiz } from "@/app/data/quizzes-v2/one-story-two-ways-quiz";

export default function Page() {
  return <QuizRunner quiz={oneStoryTwoWaysQuiz} />;
}
