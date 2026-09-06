"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { chunkByChunkQuiz } from "@/app/data/quizzes-v2/chunk-by-chunk-quiz";

export default function Page() {
  return <QuizRunner quiz={chunkByChunkQuiz} />;
}
