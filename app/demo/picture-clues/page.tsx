"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { pictureClues } from "@/app/data/lessons-v2/picture-clues";

// FACTORY-AUTHORED lesson · /demo/picture-clues
export default function Page() {
  return <LessonRunner lesson={pictureClues} />;
}
