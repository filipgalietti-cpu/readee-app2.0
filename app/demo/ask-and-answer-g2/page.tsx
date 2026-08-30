"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { askAndAnswerG2 } from "@/app/data/lessons-v2/ask-and-answer-g2";

// FACTORY-AUTHORED lesson · /demo/ask-and-answer-g2
export default function Page() {
  return <LessonRunner lesson={askAndAnswerG2} />;
}
