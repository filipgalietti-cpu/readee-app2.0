"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { picturesTellMore } from "@/app/data/lessons-v2/pictures-tell-more";

// FACTORY-AUTHORED lesson · /demo/pictures-tell-more
export default function Page() {
  return <LessonRunner lesson={picturesTellMore} />;
}
