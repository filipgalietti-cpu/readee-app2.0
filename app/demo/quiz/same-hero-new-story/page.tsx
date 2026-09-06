"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sameHeroNewStoryQuiz } from "@/app/data/quizzes-v2/same-hero-new-story-quiz";

export default function Page() {
  return <QuizRunner quiz={sameHeroNewStoryQuiz} />;
}
