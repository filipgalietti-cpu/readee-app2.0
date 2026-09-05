"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { theWholeChapterQuiz } from "@/app/data/quizzes-v2/the-whole-chapter-quiz";

export default function Page() {
  return <QuizRunner quiz={theWholeChapterQuiz} />;
}
