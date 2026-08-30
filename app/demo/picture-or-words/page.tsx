"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { pictureOrWords } from "@/app/data/lessons-v2/picture-or-words";

// FACTORY-AUTHORED lesson · /demo/picture-or-words
export default function Page() {
  return <LessonRunner lesson={pictureOrWords} />;
}
