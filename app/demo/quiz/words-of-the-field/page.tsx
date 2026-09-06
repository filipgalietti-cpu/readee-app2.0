"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordsOfTheFieldQuiz } from "@/app/data/quizzes-v2/words-of-the-field-quiz";

export default function Page() {
  return <QuizRunner quiz={wordsOfTheFieldQuiz} />;
}
