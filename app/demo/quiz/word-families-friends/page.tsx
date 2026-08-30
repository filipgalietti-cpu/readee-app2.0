"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordFamiliesFriendsQuiz } from "@/app/data/quizzes-v2/word-families-friends-quiz";

export default function Page() {
  return <QuizRunner quiz={wordFamiliesFriendsQuiz} />;
}
