"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { diagramDetectivesQuiz } from "@/app/data/quizzes-v2/diagram-detectives-quiz";

export default function Page() {
  return <QuizRunner quiz={diagramDetectivesQuiz} />;
}
