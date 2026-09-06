"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { whyTheyDidItQuiz } from "@/app/data/quizzes-v2/why-they-did-it-quiz";

export default function Page() {
  return <QuizRunner quiz={whyTheyDidItQuiz} />;
}
