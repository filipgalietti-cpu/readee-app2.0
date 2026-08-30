"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whyAuthorsWrite } from "@/app/data/lessons-v2/why-authors-write";

// FACTORY-AUTHORED lesson · /demo/why-authors-write
export default function Page() {
  return <LessonRunner lesson={whyAuthorsWrite} />;
}
