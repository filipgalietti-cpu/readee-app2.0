"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { namingDoingWords } from "@/app/data/lessons-v2/naming-doing-words";

// FACTORY-AUTHORED lesson · /demo/naming-doing-words
export default function Page() {
  return <LessonRunner lesson={namingDoingWords} />;
}
