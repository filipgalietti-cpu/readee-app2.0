"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { decodingChampionsQuiz } from "@/app/data/quizzes-v2/decoding-champions-quiz";

export default function Page() {
  return <QuizRunner quiz={decodingChampionsQuiz} />;
}
