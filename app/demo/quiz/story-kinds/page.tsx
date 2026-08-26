"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { storyKindsQuiz } from "@/app/data/quizzes-v2/story-kinds-quiz";

export default function Page() {
  return <QuizRunner quiz={storyKindsQuiz} />;
}
