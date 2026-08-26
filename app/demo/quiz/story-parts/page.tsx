"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { storyPartsQuiz } from "@/app/data/quizzes-v2/story-parts-quiz";

export default function Page() {
  return <QuizRunner quiz={storyPartsQuiz} />;
}
