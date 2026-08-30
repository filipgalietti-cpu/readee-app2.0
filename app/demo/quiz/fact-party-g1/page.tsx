"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { factPartyG1Quiz } from "@/app/data/quizzes-v2/fact-party-g1-quiz";

export default function Page() {
  return <QuizRunner quiz={factPartyG1Quiz} />;
}
