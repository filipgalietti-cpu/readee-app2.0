"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { storyShapeQuiz } from "@/app/data/quizzes-v2/story-shape-quiz";

export default function Page() {
  return <QuizRunner quiz={storyShapeQuiz} />;
}
