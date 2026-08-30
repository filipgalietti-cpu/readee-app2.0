"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { characterChallengesQuiz } from "@/app/data/quizzes-v2/character-challenges-quiz";

export default function Page() {
  return <QuizRunner quiz={characterChallengesQuiz} />;
}
