"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whatsItAboutQuiz } from "@/app/data/quizzes-v2/whats-it-about-quiz";

export default function Page() {
  return <QuizRunner quiz={whatsItAboutQuiz} />;
}
