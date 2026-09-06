"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { doesThatMakeSenseQuiz } from "@/app/data/quizzes-v2/does-that-make-sense-quiz";

export default function Page() {
  return <QuizRunner quiz={doesThatMakeSenseQuiz} />;
}
