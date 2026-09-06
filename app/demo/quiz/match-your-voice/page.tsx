"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { matchYourVoiceQuiz } from "@/app/data/quizzes-v2/match-your-voice-quiz";

export default function Page() {
  return <QuizRunner quiz={matchYourVoiceQuiz} />;
}
