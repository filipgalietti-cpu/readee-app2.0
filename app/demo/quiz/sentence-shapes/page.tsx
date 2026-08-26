"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sentenceShapesQuiz } from "@/app/data/quizzes-v2/sentence-shapes-quiz";

export default function Page() {
  return <QuizRunner quiz={sentenceShapesQuiz} />;
}
