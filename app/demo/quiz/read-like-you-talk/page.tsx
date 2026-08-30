"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { readLikeYouTalkQuiz } from "@/app/data/quizzes-v2/read-like-you-talk-quiz";

export default function Page() {
  return <QuizRunner quiz={readLikeYouTalkQuiz} />;
}
