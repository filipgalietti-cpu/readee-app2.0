"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { namingDoingWordsQuiz } from "@/app/data/quizzes-v2/naming-doing-words-quiz";

export default function Page() {
  return <QuizRunner quiz={namingDoingWordsQuiz} />;
}
