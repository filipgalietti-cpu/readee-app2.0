"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sameRootNewBranchQuiz } from "@/app/data/quizzes-v2/same-root-new-branch-quiz";

export default function Page() {
  return <QuizRunner quiz={sameRootNewBranchQuiz} />;
}
