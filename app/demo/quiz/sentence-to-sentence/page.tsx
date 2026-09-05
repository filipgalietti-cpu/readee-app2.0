"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { sentenceToSentenceQuiz } from "@/app/data/quizzes-v2/sentence-to-sentence-quiz";

export default function Page() {
  return <QuizRunner quiz={sentenceToSentenceQuiz} />;
}
