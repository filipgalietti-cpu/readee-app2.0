"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { theAuthorsViewQuiz } from "@/app/data/quizzes-v2/the-authors-view-quiz";

export default function Page() {
  return <QuizRunner quiz={theAuthorsViewQuiz} />;
}
