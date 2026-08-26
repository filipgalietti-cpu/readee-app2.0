"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { wordMusicQuiz } from "@/app/data/quizzes-v2/word-music-quiz";

export default function Page() {
  return <QuizRunner quiz={wordMusicQuiz} />;
}
