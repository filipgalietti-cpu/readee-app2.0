"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { storyMessageQuiz } from "@/app/data/quizzes-v2/story-message-quiz";

export default function Page() {
  return <QuizRunner quiz={storyMessageQuiz} />;
}
