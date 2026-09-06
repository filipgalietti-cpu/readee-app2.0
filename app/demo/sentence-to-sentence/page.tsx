"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { sentenceToSentence } from "@/app/data/lessons-v2/sentence-to-sentence";

// FACTORY-AUTHORED lesson · /demo/sentence-to-sentence
export default function Page() {
  return <LessonRunner lesson={sentenceToSentence} />;
}
