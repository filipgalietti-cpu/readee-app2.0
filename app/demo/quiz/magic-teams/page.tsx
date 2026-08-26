"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { magicTeamsQuiz } from "@/app/data/quizzes-v2/magic-teams-quiz";

export default function Page() {
  return <QuizRunner quiz={magicTeamsQuiz} />;
}
