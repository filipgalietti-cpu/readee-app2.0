"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { teamPlayersQuiz } from "@/app/data/quizzes-v2/team-players-quiz";

export default function Page() {
  return <QuizRunner quiz={teamPlayersQuiz} />;
}
