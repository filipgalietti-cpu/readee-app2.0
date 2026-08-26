"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { topicSpotterQuiz } from "@/app/data/quizzes-v2/topic-spotter-quiz";

export default function Page() {
  return <QuizRunner quiz={topicSpotterQuiz} />;
}
