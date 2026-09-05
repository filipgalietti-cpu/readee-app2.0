"use client";

import QuizRunner from "@/app/components/lesson-v2/QuizRunner";
import { mapsAndPhotosQuiz } from "@/app/data/quizzes-v2/maps-and-photos-quiz";

export default function Page() {
  return <QuizRunner quiz={mapsAndPhotosQuiz} />;
}
