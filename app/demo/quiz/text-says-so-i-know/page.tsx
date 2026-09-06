"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { textSaysSoIKnowQuiz } from "@/app/data/quizzes-v2/text-says-so-i-know-quiz";

export default function Page() {
  return <QuizRunner quiz={textSaysSoIKnowQuiz} />;
}
