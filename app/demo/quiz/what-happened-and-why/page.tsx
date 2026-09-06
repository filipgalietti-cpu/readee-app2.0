"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whatHappenedAndWhyQuiz } from "@/app/data/quizzes-v2/what-happened-and-why-quiz";

export default function Page() {
  return <QuizRunner quiz={whatHappenedAndWhyQuiz} />;
}
