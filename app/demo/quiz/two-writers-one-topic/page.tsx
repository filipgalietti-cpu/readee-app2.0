"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { twoWritersOneTopicQuiz } from "@/app/data/quizzes-v2/two-writers-one-topic-quiz";

export default function Page() {
  return <QuizRunner quiz={twoWritersOneTopicQuiz} />;
}
