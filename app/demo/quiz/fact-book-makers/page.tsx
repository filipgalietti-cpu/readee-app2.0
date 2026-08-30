"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factBookMakersQuiz } from "@/app/data/quizzes-v2/fact-book-makers-quiz";

export default function Page() {
  return <QuizRunner quiz={factBookMakersQuiz} />;
}
