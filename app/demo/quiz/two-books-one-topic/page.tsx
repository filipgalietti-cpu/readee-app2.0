"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { twoBooksOneTopicQuiz } from "@/app/data/quizzes-v2/two-books-one-topic-quiz";

export default function Page() {
  return <QuizRunner quiz={twoBooksOneTopicQuiz} />;
}
