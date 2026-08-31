"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { bookTeamUpQuiz } from "@/app/data/quizzes-v2/book-team-up-quiz";

export default function Page() {
  return <QuizRunner quiz={bookTeamUpQuiz} />;
}
