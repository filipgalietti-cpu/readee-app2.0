"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whoTellsItChangesItQuiz } from "@/app/data/quizzes-v2/who-tells-it-changes-it-quiz";

export default function Page() {
  return <QuizRunner quiz={whoTellsItChangesItQuiz} />;
}
