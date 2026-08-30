"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { ideaIllustratorsQuiz } from "@/app/data/quizzes-v2/idea-illustrators-quiz";

export default function Page() {
  return <QuizRunner quiz={ideaIllustratorsQuiz} />;
}
