"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { storyPoemPartyQuiz } from "@/app/data/quizzes-v2/story-poem-party-quiz";

export default function Page() {
  return <QuizRunner quiz={storyPoemPartyQuiz} />;
}
