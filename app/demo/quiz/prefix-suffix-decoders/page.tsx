"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { prefixSuffixDecodersQuiz } from "@/app/data/quizzes-v2/prefix-suffix-decoders-quiz";

export default function Page() {
  return <QuizRunner quiz={prefixSuffixDecodersQuiz} />;
}
