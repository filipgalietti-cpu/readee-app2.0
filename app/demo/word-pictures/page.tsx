"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { wordPictures } from "@/app/data/lessons-v2/word-pictures";

// FACTORY-AUTHORED lesson · /demo/word-pictures
export default function Page() {
  return <LessonRunner lesson={wordPictures} />;
}
