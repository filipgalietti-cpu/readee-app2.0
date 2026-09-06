"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { greekAndLatinRootsQuiz } from "@/app/data/quizzes-v2/greek-and-latin-roots-quiz";

export default function Page() {
  return <QuizRunner quiz={greekAndLatinRootsQuiz} />;
}
