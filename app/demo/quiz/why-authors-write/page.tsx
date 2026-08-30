"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whyAuthorsWriteQuiz } from "@/app/data/quizzes-v2/why-authors-write-quiz";

export default function Page() {
  return <QuizRunner quiz={whyAuthorsWriteQuiz} />;
}
